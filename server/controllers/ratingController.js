const { Sequelize } = require('sequelize')
const ApiError = require('../error/ApiError')
const { UserAnswer, QuestionGame, User, AccessGame, Role, Bonus, Game } = require('../models/index')
const validateCheck = require('../validators/isNullValidator')


class ratingController {
    async getOne(req, res, next) {
        try {
            validateCheck(!req.params.id, 'Не задан id игры')
            const { typeGame } = await Game.findByPk(req.params.id, { attributes: ["typeGame"] })
            const { countQuestion, rating } = await this.getRatingPrivate(req.params.id, typeGame)

            res.json({ countQuestion, rating })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка получения: ${error.message}`))
        }
    }

    async getRatingPrivate(gameId, typeGame, userId = null) {
        let rating = await User.findAll({
            attributes: ['id', 'username'],
            include: [{
                model: UserAnswer,
                attributes: [
                    'points',
                    'isCorrect',
                    [Sequelize.literal('"userAnswers->questionGame"."numberQuestion"'), 'numberQuestion']
                ],
                required: false,
                include: [{
                    model: QuestionGame,
                    attributes: [],
                    required: true,
                    where: {
                        gameId: gameId
                    }
                }]
            }, {
                model: Role,
                attributes: [],
                required: true,
                include: [{
                    model: AccessGame,
                    attributes: [],
                    required: true,
                    where: {
                        gameId: gameId
                    }
                }]
            }, {
                model: Bonus,
                attributes: { exclude: ["userId", "gameId"] },
                required: false,
            }],
            ...(userId && { where: { id: userId } }),
            order: [
                [Sequelize.literal('"userAnswers->questionGame"."numberQuestion"'), 'ASC']
            ]
        })
        rating = rating.map(user => {
            user = user.toJSON()
            let points = 0
            user.userAnswers.forEach(answer => {
                if (answer.isCorrect) {
                    points += answer.points
                }
            })
            if (typeGame === 'square') {
                user.pointsAnswer = points,
                    points = 0
                user.bonuses.forEach(bonus => {
                    points += bonus.points
                })
                user.pointsBonuses = points
                user.totalPoints = user.pointsBonuses + user.pointsAnswer
            }
            else {
                user.totalPoints = points
            }
            return user
        }).sort((a, b) => b.totalPoints - a.totalPoints)

        const countQuestion = await QuestionGame.count({
            where: {
                gameId: gameId
            },
        })
        return { countQuestion, rating }
    }
}

module.exports = new ratingController()

