const Joi = require('joi');

async function validateProduct(product){
    const productSchema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().max(255),
        category: Joi.string().required(),
        price: Joi.number().required(),
        quantity: Joi.number().required(),
        inStock: Joi.boolean()
    });
    try{
        await productSchema.validateAsync(product,{abortEarly: false});
        console.log("Validation passed(PRODUCT)");
        return {error: null}
    }catch(err){
        return {error: err.details.map(detail => detail.message)};
    }
}

exports.validate = validateProduct;