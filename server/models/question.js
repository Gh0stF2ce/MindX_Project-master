const sequelize = require('./../database')
const DataTypes = require('sequelize')

const Question = sequelize.define('question',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.literal(`gen_random_uuid()`),
            allowNull: false
        },
        question: {
            type: DataTypes.CITEXT,
            allowNull: false,
            unique: true
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: false
        },
    },
    {
        timestamps: false
    }
)

module.exports = Question