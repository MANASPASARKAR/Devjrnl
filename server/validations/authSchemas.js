const Joi = require("joi");

const password = Joi.string()
    .min(8)
    .max(128);

const email = Joi.string()
    .email({ tlds: { allow: false } })
    .max(254)
    .lowercase()
    .trim();

const username = Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9._-]+$/)
    .messages({
        "string.pattern.base": "username can only contain letters, numbers, dots, underscores, and hyphens",
    });

const registerSchema = Joi.object({
    name: Joi.string().trim().min(1).max(80).required(),
    username: username.required(),
    email: email.required(),
    password: password.required(),
}).required();

const loginSchema = Joi.object({
    identifier: Joi.string().trim().min(1).max(254).required(),
    password: Joi.string().min(1).max(128).required(),
}).required();

const forgotPasswordSchema = Joi.object({
    email: email.required(),
}).required();

const resetPasswordParamsSchema = Joi.object({
    token: Joi.string().hex().length(64).required(),
}).required();

const resetPasswordSchema = Joi.object({
    password: password.required(),
}).required();

const googleAuthSchema = Joi.object({
    token: Joi.string().trim().min(1).max(4096),
    access_token: Joi.string().trim().min(1).max(4096),
})
    .xor("token", "access_token")
    .required();

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordParamsSchema,
    resetPasswordSchema,
    googleAuthSchema,
};
