const mongoose = require("mongoose");
const TAGS = require('../constants/tags.js') 
const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    tags: [{
        type: String,
        enum: TAGS,
    }],
    images: [{
        type: String,
    }],
    date: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
    }
})

const Log = mongoose.model("Log", logSchema);
module.exports = Log;