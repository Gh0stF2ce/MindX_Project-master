const sequelize = require('./../database')
const DataTypes = require('sequelize')

const InvadersData = sequelize.define('invadersData', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.literal(`gen_random_uuid()`),
    allowNull: false
  },
  gameId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  level: { type: DataTypes.INTEGER, defaultValue: 1 },
  speed: { type: DataTypes.INTEGER, defaultValue: 3 },
  enemiesCount: { type: DataTypes.INTEGER, defaultValue: 10 },
  schoolClass: { type: DataTypes.STRING, allowNull: true },
  scoreFirst: { type: DataTypes.INTEGER, defaultValue: 100 },
  scoreSuccess: { type: DataTypes.INTEGER, defaultValue: 50 },
  scoreFailure: { type: DataTypes.INTEGER, defaultValue: -25 }
}, { timestamps: false })

module.exports = InvadersData
