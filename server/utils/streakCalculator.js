const Log = require("../Models/log")

module.exports.streakCalculator = async (id) => {
    let logs = await Log.find({ userId: id });
    let streak = 0;
    let d = new Date().toISOString().split('T')[0];

    let logDates = logs.map(log => log.date);
    const dateSet = new Set(logDates);

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