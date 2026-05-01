const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        // Not required for OAuth users
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
    },
    currentStreak: {
        type: Number,
        default: 0,
    },
    longestStreak: {
        type: Number,
        default: 0,
    },
    logs: [{
        type: mongoose.Types.ObjectId,
        ref: "Log",
    }],
    lastLogDate: {
        type: Date,   
    },
})

let User = mongoose.model("User", userSchema);
module.exports = User;