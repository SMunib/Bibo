const Joi = require("joi");

const validPass = async (password) => {
  const passSchema = Joi.object({
    password: Joi.string().min(6).required(),
    oldPassword: Joi.string().min(6),
  });
  try {
    await passSchema.validateAsync(password);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
};

module.exports = validPass;
