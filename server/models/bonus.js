const sequelize = require('./../database')
const DataTypes = require('sequelize')

const Bonus = sequelize.define('bonus',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.literal(`gen_random_uuid()`),
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lvl: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    },
    {
        timestamps: false
    }
)

module.exports = Bonus