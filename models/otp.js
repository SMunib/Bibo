const { DataTypes } = require("sequelize");
const { sequelize } = require("../startup/db");

const Otp = sequelize.define(
  "Otp",
  {
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ["active", "deactivated"],
      defaultValue: "active",
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Otp;
