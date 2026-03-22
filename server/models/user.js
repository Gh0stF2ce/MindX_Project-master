const sequelize = require('./../database')
const DataTypes = require('sequelize')

const User = sequelize.define('user',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.literal(`gen_random_uuid()`),
            allowNull: false
        },
        username: {
            type: DataTypes.CITEXT,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tokenVersion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    },
    {
        timestamps: false
    }
)

module.exports = User;
