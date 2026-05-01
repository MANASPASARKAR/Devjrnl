const AppError = require("../utils/appError");

const getValidationMessage = (error) => {
    return error.details
        .map(detail => detail.message.replace(/"/g, ""))
        .join(", ");
};

const validate = (source, schema) => (req, res, next) => {
    const { value, error } = schema.validate(req[source], {
        abortEarly: false,
        convert: true,
    });

    if (error) {
        return next(new AppError(getValidationMessage(error), 400));
    }

    req[source] = value;
    return next();
};

const validateBody = (schema) => validate("body", schema);
const validateQuery = (schema) => validate("query", schema);
const validateParams = (schema) => validate("params", schema);

module.exports = {
    validateBody,
    validateQuery,
    validateParams,
};
