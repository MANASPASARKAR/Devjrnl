const Log = require("../Models/log")

module.exports.streakCalculator = async (id) => {
    let logs = await Log.find({ userId: id });
    let streak = 0;
    let todayDate = new Date();
    let today = todayDate.toISOString().split('T')[0];
    
    let yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    let yesterday = yesterdayDate.toISOString().split('T')[0];

    let logDates = logs.map(log => new Date(log.date).toISOString().split('T')[0]);
    const dateSet = new Set(logDates);

    let d;
    if (dateSet.has(today)) {
        d = today;
    } else if (dateSet.has(yesterday)) {
        d = yesterday;
    } else {
        return 0; // Missed yesterday and today, streak is broken
    }

    let gap = false;

    while (gap == false) {
        if (dateSet.has(d)) {
            streak++;
            let dateObj = new Date(d);
            dateObj.setDate(dateObj.getDate() - 1);
            d = dateObj.toISOString().split('T')[0];
        } else {
            gap = true;
        }
    }

    return streak;

}