const sequelize = require('./../database')
const DataTypes = require('sequelize')

const Role = sequelize.define('role',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.literal(`gen_random_uuid()`),
            allowNull: false
        },
        name: {
            type: DataTypes.CITEXT,
            allowNull: false,
            unique: true
        }
    },
    {
        timestamps: false
    }
)

module.exports = Role 