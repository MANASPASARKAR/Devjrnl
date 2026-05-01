const { createClient } = require('@supabase/supabase-js');
const AppError = require("../utils/appError");
const Log = require("../Models/log");
const TAGS = require("../constants/tags");
const { streakCalculator } = require("../utils/streakCalculator");
const User = require("../Models/user");

const getSupabase = () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("SUPABASE_URL and SUPABASE_KEY must be set in the .env file");
    }
    return createClient(supabaseUrl, supabaseKey);
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

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            const supabase = getSupabase();
            for (const file of req.files) {
                const fileExt = file.originalname.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from('devjrnl')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                    });

                if (error) {
                    console.error("Supabase upload error:", error);
                    throw new AppError("Failed to upload image to Supabase", 500);
                }

                const { data: publicUrlData } = supabase.storage
                    .from('devjrnl')
                    .getPublicUrl(fileName);

                imageUrls.push(publicUrlData.publicUrl);
            }
        }

        const newLog = new Log({ title, content, tags, images: imageUrls, date: new Date(), userId: req.user._id });
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
            tagArr = tags.split(",");
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
            const supabase = getSupabase();
            for (const url of deletedImages) {
                const fileName = url.split('/').pop();
                await supabase.storage.from('devjrnl').remove([fileName]);
                imageUrls = imageUrls.filter(img => img !== url);
            }
        }

        if (req.files && req.files.length > 0) {
            const supabase = getSupabase();
            for (const file of req.files) {
                const fileExt = file.originalname.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error } = await supabase.storage
                    .from('devjrnl')
                    .upload(fileName, file.buffer, { contentType: file.mimetype });

                if (!error) {
                    const { data: publicUrlData } = supabase.storage
                        .from('devjrnl')
                        .getPublicUrl(fileName);
                    imageUrls.push(publicUrlData.publicUrl);
                }
            }
        }

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
            const supabase = getSupabase();
            const filesToRemove = log.images.map(url => url.split('/').pop());
            await supabase.storage.from('devjrnl').remove(filesToRemove);
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