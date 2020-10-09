const Joi = require('@hapi/joi');

/////////////////////////////////////////////////////////
// create user validation
/////////////////////////////////////////////////////////
const subscriberSchema = Joi.object({
    email: Joi.string().trim().email({ minDomainSegments: 2 }).required(),
});

const invalidSubscriberErrorsJSON = (errors) => {
    let _errors = {};
    for (e of errors.details) {
        _errors[e.path] = e.message;
    }
    return _errors;
};

const validateSubscriber = async (subscriberObj) => {
    const options = { abortEarly: false };
    const value = await subscriberSchema.validateAsync(subscriberObj, options);
    return value;
};

module.exports = {
    validateSubscriber,
    invalidSubscriberErrorsJSON
}