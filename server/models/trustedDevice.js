const sequelize = require('../database');
const DataTypes = require('sequelize');

const TrustedDevice = sequelize.define(
  'trustedDevice',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.literal('gen_random_uuid()'),
      allowNull: false,
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    updatedAt: false,
  }
);

module.exports = TrustedDevice;
