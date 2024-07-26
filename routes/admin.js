const express = require("express");
const router = express.Router();
const validate = require("../validators/login").validate;
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

router.route("/").post(async (req, res) => {
  const { User, Token } = req.models;
  try {
    const { error } = await validate(req.body);
    if (error) return res.status(400).send(error);
    let user = await User.findOne({
      where: {
        [Op.or]: [
          { email: req.body.email || null },
          { number: req.body.number || null },
        ],
      },
    });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      return res.status(400).send("Passwords do not match");
    }
    if (user.role !== "admin") {
      return res
        .status(401)
        .send("Warning!Do not have priveleges to access this page");
    }

    const token = await user.generateToken();
    await Token.create({
      key: token,
      userId: user.id,
      keyType: "access",
    });
    return res.header("x-auth-token", token).status(200).json({ user, token });
  } catch (err) {
    return res.status(500).send("Error" + err);
  }
});

router.route("/forgetpassword").post(async (req, res) => {
  const { email } = req.body;
  const { User, Token } = req.models;
  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) return res.status(400).send({ message: "User does not exist" });
    if (user.role !== "admin")
      return res.status(401).send({ message: "Insufficient priveleges" });
    const secret = process.env.jwtSecret + user.password;
    const payload = {
      email: user.email,
      id: user.id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    const link = `http://localhost:3000/resetpassword/${user.id}/${token}`;
    const transaction = await sequelize.transaction();
    try {
      await Token.destroy(
        {
          where: {
            userId: user.id,
          },
        },
        transaction
      );

      await Token.create(
        {
          key: token,
          userId: user.id,
          keyType: "reset",
        },
        transaction
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      return res.status(400).send("Error" + err);
    }
    // const emailOptions = {
    //   from: "munibur.rehman@eplanetglobal.com",
    //   to: user.email,
    //   subject: "Password Reset",
    //   html: `<p> Click <a href="${link}" here</a> to reset your password.</p>`,
    // };

    // transporter.sendMail(emailOptions, (error, info) => {
    //   if (error) {
    //     console.log(error);
    //     return res
    //       .status(500)
    //       .send({ message: "Email sending failed", success: false });
    //   } else {
    //     console.log("Email Sent: " + info.response);
    //     return res.status(200).send({
    //       message: "Password reset link has been sent",
    //       success: true,
    //     });
    return res.status(200).json({ link });
  } catch (err) {
    // });
    return res
      .status(500)
      .send({ message: "Password Reset has failed...." + err, success: false });
  }
});

router.route("/productCount").get(async (req, res) => {
  const { Product } = req.models;
  const productCount = await Product.count();
  if (!productCount)
    return res.status(404).json({ message: "Product list is empty" });
  return res.status(200).send(productCount);
});

router.route("/purchaseCount").get(async (req, res) => {
  const { Purchase } = req.models;
  const purchaseCount = await Purchase.count();
  if (!purchaseCount)
    return res.status(404).json({ message: "Purchase list is empty" });
  return res.status(200).send(purchaseCount);
});

router.route("/productDetails").get(async (req, res) => {
  const { Product, User } = req.models;
  try {
    const products = await Product.findAll({
      include: {
        model: User,
        as: "user",
        attributes: ["id", "username"],
      },
    });
    if (!products)
      return res.status(404).json({ message: "products not found" });
    return res.status(200).json(products);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error" + err });
  }
});

router.route("/users").get(async (req, res) => {
  const { User } = req.models;
  try {
    const users = await User.findAll();
    if (!users) return res.status(404).json({ error: "users not found" });
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.route("/users/:userId/purchases").get(async (req, res) => {
  const userId = req.params.id;
  const { User, Purchase } = req.models;
  try {
    const user = await User.findByPk(userId, {
      include: {
        model: Purchase,
        as: "purchases",
        attributes: ["name", "id", "price", "quantity", "displayPicture"],
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user.purchases);
  } catch (err) {
    console.error("Error retrieving purchase history: ", err);
    return res.status(500).json({ error: err });
  }
});

router.route("/blockUser/:id").post(async (req, res) => {
  const userId = req.params.id;
  const { User } = req.models;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const updatedUser = await user.update({ isBlocked: true });
    return res.status(200).json({ updatedUser });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.route("blockProduct/:id").post(async (req, res) => {
  const { Product } = req.models;
  const id = req.params.id;
  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const updatedProduct = await product.update({ isBlocked: true });
    return res.status(200).json({ updatedProduct });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

module.exports = router;
