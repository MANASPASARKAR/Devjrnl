const mongoose = require("mongoose");
const TAGS = require('../constants/tags.js') 
const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    content: {
        type: String,
        required: true,
    },
    tags: [{
        type: String,
        enum: TAGS,
    }],
    date: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
    }
})

const Log = mongoose.model("Log", logSchema);
module.exports = Log;