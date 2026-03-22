const sequelize = require('../database');
const DataTypes = require('sequelize');

const SecurityEvent = sequelize.define(
  'securityEvent',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.literal('gen_random_uuid()'),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'success',
    },
    targetType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    targetId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    updatedAt: false,
  }
);

module.exports = SecurityEvent;
