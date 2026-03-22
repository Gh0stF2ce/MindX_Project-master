const sequelize = require('../database')
const DataTypes = require('sequelize')

const AccessGame = sequelize.define('accessGame',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.literal(`gen_random_uuid()`),
            allowNull: false
        }
    },
    {
        timestamps: false
    }
)

module.exports = AccessGame