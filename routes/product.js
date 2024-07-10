const express = require("express");
const router = express.Router();
const validate = require("../middleware/validation").validate;
const Product = require("../models/product");
const User = require("../models/user");
const verify = require("../middleware/auth");
const fs = require("fs");
const baseUrl = `http://localhost:${process.env.PORT}/`;

router.route("/add").post(verify, validate, async (req, res) => {
  try {
    if (req.files && req.files.length > 0) {
      const displayPicture = req.files[0];
      const { name, description, price, category, quantity } = req.body;
      const owner = await User.findByPk(req.user.id);
      if (!owner) return res.status(400).json({ error: "Owner not found" });

      const ownerid = req.user.id;
      const path = `uploads/${Date.now() + displayPicture.originalname}`;
      fs.writeFileSync(path, displayPicture.buffer);

      const product = await Product.create({
        name,
        description,
        price,
        category,
        quantity,
        displayPicture: path,
        ownerid,
      });
      const productData = {
        ...product.toJSON(),
        displayPicture: `${baseUrl}${path}`,
      };
      return res.status(201).json(productData);
    } else {
      return res.status(400).json({ error: "File not uploaded" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error creating product" });
  }
});

router.route("/remove/:id").patch(verify, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).send("Specified product does not exist");
    await product.update({ deleteStatus: Date.now() });
    return res.status(200).json({ message: "Product removed", product });
  } catch (err) {
    return res.status(500).send("Error deleting product");
  }
});

router.route("/display").get(verify, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        deleteStatus: null,
      },
    });
    if (!products) return res.status(404).send("There are no products");
    const productData = products.map((product) => ({
      ...product.toJSON(),
      displayPicture: `${baseUrl}${product.displayPicture}`,
    }));
    return res.status(200).json(productData);
  } catch (err) {
    return res.status(500).send("Error displaying products");
  }
});

router.route("/edit/:id").patch(verify, validate, async (req, res) => {
  const productid = req.params.id;
  try {
    let product = await Product.findByPk(productid);
    if (!product) return res.status(400).send("product not found");

    const { name, description, price, category, quantity } = req.body;

    const updatedProductData = {
      ...product.toJSON(), // Spread the current product properties
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price }),
      ...(category && { category }),
      ...(quantity && { quantity }),
    };
    await product.update(updatedProductData);

    if (req.files && req.files.length > 0) {
      const displayPicture = req.files[0];
      const path = `uploads/${Date.now() + displayPicture.originalname}`;
      fs.writeFileSync(path, displayPicture.buffer);
      await product.update({
        displayPicture: path,
      });
      const productData = {
        ...product.toJSON(),
        displayPicture: `${baseUrl}${path}`,
      };
      return res.status(200).json(productData);
    }
    const productData = {
      ...product.toJSON(),
      displayPicture: `${baseUrl}${product.displayPicture}`,
    };
    return res.status(200).json(productData);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Unable to edit product");
  }
});

module.exports = router;
