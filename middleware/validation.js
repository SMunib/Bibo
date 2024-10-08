const Joi = require("joi");

async function validateProduct(Product) {
  const productSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().max(255),
    category: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    inStock: Joi.boolean(),
  });
  try {
    await productSchema.validateAsync(Product, { abortEarly: false });
    console.log("Validation passed(PRODUCT)");
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

function validationMiddleware(req, res, next) {
  validateProduct(req.body)
    .then((result) => {
      if (result.error) {
        return res.status(400).json({ errors: result.error.details });
      }
      next();
    })
    .catch((err) => {
      res.status(500).json({ error: "Internal Error" });
    });
}

exports.validate = validationMiddleware;
