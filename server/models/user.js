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
        email: {
            type: DataTypes.CITEXT,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        isTwoFactorEnabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        tokenVersion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        failedLoginAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        loginLockUntil: {
            type: DataTypes.DATE,
            allowNull: true
        },
        lastPasswordChangedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
    },
    {
        timestamps: false
    }
)

module.exports = User;
