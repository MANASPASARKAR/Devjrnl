export const MAX_LOGS_PER_DAY = 3;
export const DAILY_LOG_LIMIT_ERROR = "You can only have 3 logs for this day";

export function getUtcDateKey(date) {
    return new Date(date).toISOString().split("T")[0];
}

export function getTodayLogCount(logs) {
    const today = getUtcDateKey(new Date());
    return logs.filter(log => getUtcDateKey(log.date) === today).length;
}

export function hasReachedDailyLogLimit(logs) {
    return getTodayLogCount(logs) >= MAX_LOGS_PER_DAY;
}
