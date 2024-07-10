const express = require("express");
const router = express.Router();
const Purchase = require("../models/purchases");
const Product = require("../models/product");
const verify = require("../middleware/auth");
const Op = require("sequelize");
const { sequelize } = require("../startup/db");
const baseUrl = `http://localhost:${process.env.PORT}/`;

router.route("/find").get(verify, async (req, res) => {
  const id = req.user.id;
  try {
    const products = await Product.findAll({
      where: {
        ownerid: {
          [Op.ne]: id,
        },
      },
    });
    if (!products)
      return res
        .status(400)
        .json({ message: "No products available for purchase" });
    const productData = products.map((product) => ({
      ...product.toJSON(),
      displayPicture: `${baseUrl}${product.displayPicture}`,
    }));
    return res.status(200).json(productData);
  } catch (err) {
    return res.status(500).send("Error occured: " + err);
  }
});

router.route("/buy/:id").post(verify, async (req, res) => {
  const id = req.params.id;
  const purchaseQuantity = req.body.quantity;
  try {
    const productDetails = await Product.findOne({
      attributes: ["name", "price", "quantity", "inStock", "displayPicture"],
      where: { id: id },
    });
    if (!productDetails)
      return res.status(400).json({ message: "Product not found" });

    if (productDetails.inStock === false)
      return res
        .status(400)
        .json({ error: "Product not in stock", productDetails });
    if (purchaseQuantity > productDetails.quantity)
      return res.status(400).json({ error: "Not Enough Stock" });

    const availability = productDetails.quantity - purchaseQuantity;
    let updatedData;
    if (availability <= 0) {
      updatedData = {
        quantity: 0,
        inStock: false,
      };
    } else {
      updatedData = {
        quantity: availability,
      };
    }
    const transaction = await sequelize.transaction();
    try {
      await Product.update(updatedData, { where: { id: id } }, transaction);
      const purchase = await Purchase.create(
        {
          name: productDetails.name,
          price: productDetails.price,
          quantity: purchaseQuantity,
          displayPicture: productDetails.displayPicture,
          userId: id,
        },
        { transaction }
      );
      await transaction.commit();
      const purchaseData = {
        ...purchase.toJSON(),
        displayPicture: `${baseUrl}${path}`,
      };
      return res.status(201).json(purchaseData);
    } catch (err) {
      await transaction.rollback();
      console.log("transaction rolled back due to error: " + err);
      return res
        .status(500)
        .json({ error: "Error occured while processing your request" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: "An error occured while processing your request" });
  }
});

router.route("/records").get(verify, async (req, res) => {
  const id = req.user.id;
  const records = await Purchase.findAll({ where: { userId: id } });
  if (!records)
    res.status(400).json({ message: "User purchase records are empty" });
  const recordData = records.map((record) => ({
    ...record.toJSON(),
    displayPicture: `${baseUrl}${record.displayPicture}`,
  }));
  return res.status(200).json(recordData);
});
module.exports = router;
