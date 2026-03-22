const sequelize = require('./../database')
const DataTypes = require('sequelize')

const QuestionGame = sequelize.define('questionGame',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.literal(`gen_random_uuid()`),
            allowNull: false
        },
        numberQuestion: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    },
    {
        timestamps: false
    }
)

module.exports = QuestionGame