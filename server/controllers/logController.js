const AppError = require("../utils/appError");
const Log = require("../Models/log");
const TAGS = require("../constants/tags");
const { streakCalculator } = require("../utils/streakCalculator");
const User = require("../Models/user");
const { createSupabaseClient, getSupabaseErrorMessage } = require("../utils/supabaseClient");

const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "devjrnl";
const MAX_LOGS_PER_DAY = 3;

const getSupabase = createSupabaseClient;

const parseLogDate = (date) => {
    if (!date) return new Date();

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new AppError("Invalid date provided", 400);
    }

    return parsedDate;
};

const getUtcDayBounds = (date) => {
    const startOfDay = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    ));
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    return { startOfDay, endOfDay };
};

const getImagePath = (file, userId) => {
    const fileExt = file.originalname.split('.').pop();
    const safeExt = fileExt && fileExt !== file.originalname ? fileExt : "jpg";
    return `logs/${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${safeExt}`;
};

const getStoragePathFromUrl = (url) => {
    try {
        const { pathname } = new URL(url);
        const publicPathPrefix = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
        const publicPathIndex = pathname.indexOf(publicPathPrefix);
        if (publicPathIndex !== -1) {
            return decodeURIComponent(pathname.slice(publicPathIndex + publicPathPrefix.length));
        }
    } catch (err) {
        // Fall back to legacy root-level paths below.
    }

    return decodeURIComponent(url.split('/').pop());
};

const uploadImagesToSupabase = async (files, userId) => {
    if (!files || files.length === 0) return [];

    const supabase = getSupabase();
    const imageUrls = [];

    for (const file of files) {
        if (!file.mimetype?.startsWith("image/")) {
            throw new AppError("Only image uploads are allowed", 400);
        }

        const filePath = getImagePath(file, userId);
        const { error } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            console.error("Supabase upload error:", {
                bucket: SUPABASE_BUCKET,
                statusCode: error.statusCode,
                message: getSupabaseErrorMessage(error),
            });
            throw new AppError(`Failed to upload image to Supabase: ${getSupabaseErrorMessage(error)}`, 500);
        }

        const { data: publicUrlData } = supabase.storage
            .from(SUPABASE_BUCKET)
            .getPublicUrl(filePath);

        imageUrls.push(publicUrlData.publicUrl);
    }

    return imageUrls;
};

const removeImagesFromSupabase = async (imageUrls) => {
    const filesToRemove = (imageUrls || [])
        .map(getStoragePathFromUrl)
        .filter(Boolean);

    if (filesToRemove.length === 0) return;

    const supabase = getSupabase();
    const { error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .remove(filesToRemove);

    if (error) {
        console.error("Supabase delete error:", {
            bucket: SUPABASE_BUCKET,
            files: filesToRemove,
            statusCode: error.statusCode,
            message: getSupabaseErrorMessage(error),
        });
        throw new AppError(`Failed to delete image from Supabase: ${getSupabaseErrorMessage(error)}`, 500);
    }
};

const createLog = async (req, res, next) => {
    try {
        let { title, content, date } = req.body;
        let tags = req.body.tags;

        if (typeof tags === 'string') {
            try {
                tags = JSON.parse(tags);
            } catch (e) {
                // Ignore parse error, maybe it's just a single tag string
                tags = [tags];
            }
        }

        if (!content || !tags || !title) {
            throw new AppError("Content, tags and title are required", 400);
        }

        if (!Array.isArray(tags) || !tags.every(tag => TAGS.includes(tag))) {
            throw new AppError("Invalid tag provided", 400);
        }

        const logDate = parseLogDate(date);
        const { startOfDay, endOfDay } = getUtcDayBounds(logDate);
        const logsOnDay = await Log.countDocuments({
            userId: req.user._id,
            date: { $gte: startOfDay, $lt: endOfDay },
        });

        if (logsOnDay >= MAX_LOGS_PER_DAY) {
            throw new AppError("You can create a maximum of 3 logs for this day", 400);
        }

        const imageUrls = await uploadImagesToSupabase(req.files, req.user._id);

        const newLog = new Log({ title, content, tags, images: imageUrls, date: logDate, userId: req.user._id });
        await newLog.save();

        const user = await User.findById(req.user._id);
        const newStreak = await streakCalculator(req.user._id);
        await User.findByIdAndUpdate(req.user._id, { currentStreak: newStreak, longestStreak: Math.max(newStreak, user.longestStreak), $push: { logs: newLog._id } });
        return res.status(201).json("log successfully created");

    } catch (err) {
        next(err);
    }
}



const getLogs = async (req, res, next) => {
    try {
        let { search, tags } = req.query;

        let tagArr = [];
        if (tags) {
            tagArr = Array.isArray(tags) ? tags : tags.split(",");
        }

        if (tags && !tagArr.every(tag => TAGS.includes(tag))) {
            throw new AppError("Invalid tags provided", 400)
        }

        let searchObj = {
            userId: req.user._id,
        };

        if (search) {
            searchObj = { ...searchObj, content: { $regex: search, $options: "i" } };
        }

        if (tags) {
            searchObj = { ...searchObj, tags: { $in: tagArr } }
        }

        const logs = await Log.find(searchObj).sort({ date: -1 });
        return res.status(200).json(logs);
    } catch (err) {
        next(err);
    }
}


const getSpecificLog = async (req, res, next) => {
    try {
        const log = await Log.findById(req.params.id);
        if (!log || log.userId.toString() !== req.user._id.toString()) {
            throw new AppError("Log not found", 404);
        }
        res.status(200).json(log);
    } catch (err) {
        next(err);
    }
}

const editLog = async (req, res, next) => {
    try {
        let { title, content } = req.body;
        let tags = req.body.tags;
        let deletedImages = req.body.deletedImages;

        if (typeof tags === 'string') {
            try { tags = JSON.parse(tags); } catch (e) { tags = [tags]; }
        }

        if (typeof deletedImages === 'string') {
            try { deletedImages = JSON.parse(deletedImages); } catch (e) { deletedImages = []; }
        }

        if (tags && (!Array.isArray(tags) || !tags.every(tag => TAGS.includes(tag)))) {
            throw new AppError("Invalid tag provided", 400);
        }

        const log = await Log.findOne({ _id: req.params.id, userId: req.user._id });
        if (!log) throw new AppError("Log not found", 404);

        let imageUrls = log.images || [];

        if (deletedImages && deletedImages.length > 0) {
            await removeImagesFromSupabase(deletedImages);
            imageUrls = imageUrls.filter(img => !deletedImages.includes(img));
        }

        imageUrls.push(...await uploadImagesToSupabase(req.files, req.user._id));

        log.title = title || log.title;
        log.content = content || log.content;
        log.tags = tags || log.tags;
        log.images = imageUrls;

        await log.save();

        res.status(200).json(log);

    } catch (err) {
        next(err);
    }
}

const deleteLog = async (req, res, next) => {
    try {
        let logToBeDeletedId = req.params.id;
        let log = await Log.findOne({ _id: req.params.id, userId: req.user._id });

        if (!log) {
            throw new AppError("log not found", 404);
        }

        if (log.images && log.images.length > 0) {
            await removeImagesFromSupabase(log.images);
        }

        await Log.findByIdAndDelete(logToBeDeletedId);

        const newStreak = await streakCalculator(req.user._id);
        await User.findByIdAndUpdate(req.user._id, { currentStreak: newStreak, $pull: { logs: logToBeDeletedId } });
        res.status(200).json("Successfully deleted");
    } catch (err) {
        next(err);
    }
}

module.exports = { createLog, getLogs, getSpecificLog, editLog, deleteLog }
