const Joi = require("joi");

async function validateLogin(user) {
  const loginSchema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().required().min(8),
    number: Joi.string(),
  }).xor("email", "number");
  try {
    await loginSchema.validateAsync(user);
    console.log("Validation passed(login)");
    return {};
  } catch (err) {
    return { error: err.message };
  }
}

exports.validate = validateLogin;
