const Joi = require('joi');

const validate = (data) => {
    const choiceSchema = Joi.object().keys({
        choice: Joi.string().required(),
        answer: Joi.boolean().required()
    });
    const questionSchema = Joi.object().keys({
        A: choiceSchema.required(),
        B: choiceSchema.required(),
        C: choiceSchema.required(),
        D: choiceSchema.required()
    });

    const questionsSchema = Joi.object().keys({
        text: Joi.string().required(),
        type: Joi.string().required(),
        choices: Joi.alternatives().conditional('type', { is: "multiplechoice", then: questionSchema.required() }),
        answer: Joi.alternatives().conditional('type', { is: "truefalse", then: Joi.string().valid("correct", "incorrect").required() })
    });

    const schema = Joi.object().keys({
        title: Joi.string().required(),
        questions: Joi.array().items(questionsSchema).required(),
        status: Joi.string().allow('publish', '').optional(),
    });

    const { error } = schema.validate(data, { abortEarly: false });

    return error;
}

module.exports = {
    validate
}