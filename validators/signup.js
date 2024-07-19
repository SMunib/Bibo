const Joi = require("joi");

async function validateUser(user) {
  const userSchema = Joi.object({
    companyName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().min(8).required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().length(5).required(),
    country: Joi.string().required(),
    number: Joi.string().length(11).required(),
    address: Joi.string().required(),
    einNumber: Joi.string().required(),
    storeCategory: Joi.string().required(),
    role: Joi.string().required(),
  });
  try {
    await userSchema.validateAsync(user, { abortEarly: false });
    console.log("validation passed");
    return { error: null };
  } catch (err) {
    return { error: err.details.map((detail) => detail.message) };
  }
}

exports.validate = validateUser;
