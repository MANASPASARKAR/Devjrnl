const Joi = require("joi");
const TAGS = require("../constants/tags");

const objectId = Joi.string()
    .hex()
    .length(24);

const tagSchema = Joi.string().valid(...TAGS);
const tagsArraySchema = Joi.array()
    .items(tagSchema)
    .min(0)
    .max(TAGS.length)
    .unique();

const parseTags = (value, helpers) => {
    let parsed;

    try {
        parsed = JSON.parse(value);
    } catch (err) {
        parsed = value.includes(",") ? value.split(",").map(tag => tag.trim()) : [value];
    }

    const { error } = tagsArraySchema.validate(parsed);
    if (error) return helpers.message("tags must contain valid tag values");

    return parsed;
};

const tagsSchema = Joi.alternatives().try(
    tagsArraySchema,
    Joi.string().trim().custom(parseTags)
);

const parseDeletedImages = (value, helpers) => {
    let parsed;

    try {
        parsed = JSON.parse(value);
    } catch (err) {
        return helpers.message("deletedImages must be a JSON array");
    }

    const { error } = deletedImagesArraySchema.validate(parsed);
    if (error) return helpers.message("deletedImages must contain valid image URLs");

    return parsed;
};

const deletedImagesArraySchema = Joi.array()
    .items(Joi.string().uri({ scheme: ["http", "https"] }))
    .max(3);

const deletedImagesSchema = Joi.alternatives().try(
    deletedImagesArraySchema,
    Joi.string().trim().custom(parseDeletedImages)
);

const createLogSchema = Joi.object({
    title: Joi.string().trim().min(1).max(100).required(),
    content: Joi.string().trim().min(1).max(20000).required(),
    tags: tagsSchema.required(),
    date: Joi.date().iso(),
}).required();

const editLogSchema = Joi.object({
    title: Joi.string().trim().min(1).max(100),
    content: Joi.string().trim().min(1).max(20000),
    tags: tagsSchema,
    deletedImages: deletedImagesSchema.default([]),
}).required();

const getLogsQuerySchema = Joi.object({
    search: Joi.string().trim().min(1).max(200),
    tags: tagsSchema,
}).required();

const logIdParamsSchema = Joi.object({
    id: objectId.required(),
}).required();

module.exports = {
    createLogSchema,
    editLogSchema,
    getLogsQuerySchema,
    logIdParamsSchema,
};
