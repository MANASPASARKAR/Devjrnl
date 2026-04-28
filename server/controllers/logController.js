const AppError = require("../utils/appError");
const Log = require("../Models/log");
const TAGS = require("../constants/tags");
const { streakCalculator } = require("../utils/streakCalculator");
const User = require("../Models/user");

const createLog = async (req, res, next) => {
    try {
        let { title, content, tags, date } = req.body;
        if (!content || !tags || !title) {
            throw new AppError("Content, tags and title are required", 400);
        }

        if (!tags.every(tag => TAGS.includes(tag))) {
            throw new AppError("Invalid tag provided", 400);
        }

        // if (date) {
        //     const today = new Date().toISOString().split('T')[0];

        //     const threeMonthsAgo = new Date();
        //     threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        //     const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];

        //     if (date > today) {
        //         throw new AppError("Log date cannot be in the future", 400);
        //     }

        //     if (date < threeMonthsAgoStr) {
        //         throw new AppError("Log date cannot be older than 3 months", 400);
        //     }
        // }

        const newLog = new Log({ title, content, tags, date: new Date(), userId: req.user._id });
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
        let { title, content, tags } = req.body;

        if (tags && !tags.every(tag => TAGS.includes(tag))) {
            throw new AppError("Invalid tag provided", 400);
        }


        const log = await Log.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { title, content, tags },
            { new: true }
        );

        if (!log) {
            throw new AppError("Log not found", 404);
        }

        res.status(200).json(log);

    } catch (err) {
        next(err);
    }
}

const deleteLog = async (req, res, next) => {
    try {
        let logToBeDeletedId = req.params.id;
        let log = await Log.findOneAndDelete({
            _id: req.params.id, userId: req.user._id
        });

        if (!log) {
            throw new AppError("log not found", 404);
        }

        const newStreak = await streakCalculator(req.user._id);
        await User.findByIdAndUpdate(req.user._id, { currentStreak: newStreak, $pull: { logs: logToBeDeletedId } });
        res.status(200).json("Successfully deleted");
    } catch (err) {
        next(err);
    }
}

module.exports = { createLog, getLogs, getSpecificLog, editLog, deleteLog }