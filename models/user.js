const { DataTypes } = require("sequelize");
const { sequelize } = require("../startup/db");
const jwt = require("jsonwebtoken");
const Token = require("./tokens");

const User = sequelize.define("User", {
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 5],
    },
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [11, 11],
    },
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  einNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  storeCategory: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  role: {
    type: DataTypes.ENUM,
    values: ["owner", "admin", "customer"],
    allowNull: false,
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

User.prototype.generateToken = async function () {
  await Token.destroy({ where: { userId: this.id } });
  const jwtkey = process.env.jwtSecretKey;
  const token = jwt.sign({ id: this.id, role: this.role ,companyName: this.companyName}, jwtkey, {
    expiresIn: "1h",
  });
  await Token.create({ key: token, userId: this.id, keyType: "access" });
  return token;
};

module.exports = User;
