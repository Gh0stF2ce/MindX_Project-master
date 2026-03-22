const sequelize = require('./../database')
const DataTypes = require('sequelize')

const ThemeGame = sequelize.define('themeGame',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.literal(`gen_random_uuid()`),
            allowNull: false
        },
        numberTheme: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    },
    {
        timestamps: false
    }
)

module.exports = ThemeGame