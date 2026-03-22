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
    },
    {
        timestamps: false
    }
)

module.exports = User;