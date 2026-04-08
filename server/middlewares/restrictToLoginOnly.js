const { getUser } = require("../service/authService");
const AppError = require("../utils/appError");

const restrictToLoggedInOnly = (req, res, next) => {
    try {
        let userId = req.cookies.uid;

        let user = getUser(userId)
        if (!user) {
            throw new AppError("User not logged in", 401)
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }

}

module.exports = restrictToLoggedInOnly