const sequelize = require('../database');
const DataTypes = require('sequelize');

const AuthCode = sequelize.define(
  'authCode',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.literal('gen_random_uuid()'),
      allowNull: false,
    },
    purpose: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.CITEXT,
      allowNull: true,
    },
    codeHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    challengeToken: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    consumedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    updatedAt: false,
  }
);

module.exports = AuthCode;
