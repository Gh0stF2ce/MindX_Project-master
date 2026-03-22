const ApiError = require('../error/ApiError')
const { QuestionGame, Question, UserAnswer } = require('../models/index')
const validateCheck = require('../validators/isNullValidator')

class questionGameController {
    async createForGame(questionGame, transaction) {
        await QuestionGame.bulkCreate(questionGame, { transaction })
    }
    async create(req, res, next) {
        try {
            const { questionId, gameId } = req.body
            const isQuestionGame = await QuestionGame.findOne({
                where: {
                    questionId: questionId,
                    gameId: gameId,
                },
                attributes: ['id']
            })
            validateCheck(isQuestionGame, 'Вопрос уже добавлен к игре!')
            const countQuestion = await QuestionGame.count({
                where: {
                    gameId: gameId,
                },
            });
            const questionGameData = await QuestionGame.create({ questionId, gameId, numberQuestion: countQuestion + 1 })
            res.json({ message: 'Вопрос добавлен к игре', questionGameData })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка создания: ${error.message}`))
        }
    }

    async getAll(req, res, next) {
        try {
            const questionGames = await QuestionGame.findAll()
            res.json(questionGames)
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка получения: ${error.message}`))
        }
    }

    async getOne(req, res, next) {
        try {
            const questionGames = await QuestionGame.findAll({
                attributes: { exclude: ['gameId', 'questionId'] },
                where: {
                    gameId: req.params.id
                },
                include: [{
                    model: Question,
                    required: false,
                    attributes: { exclude: ['answer'] }
                },
                {
                    model: UserAnswer,
                    required: false,
                    attributes: { exclude: ['userId', 'questionGameId'] }
                }]
            })
            res.json(questionGames)
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка получения: ${error.message}`))
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id вопроса игры!')
            const { questionId } = req.body
            const isUpdate = await QuestionGame.update(
                {
                    questionId: questionId,
                },
                {
                    where: {
                        id: id,
                    }
                }
            )
            validateCheck(!isUpdate[0], 'Вопрос игры не найдены')
            res.json({ message: 'Вопрос игры обновлен' })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка обновления: ${error.message}`))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id вопроса игры!')
            const lastQuestionId = (await QuestionGame.findAll({
                attributes: ['id'],
                order: [['numberQuestion', 'DESC']],
                limit: 1
            }))[0].dataValues.id
            validateCheck(lastQuestionId !== id, 'Можно удалить только последний вопрос!')
            const isDelete = await QuestionGame.destroy({
                where: {
                    id: id,
                },
            })
            validateCheck(!isDelete, 'Вопрос игры не найден!')
            res.json({ message: 'Вопрос игры удален' })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка удаления: ${error.message}`))
        }
    }
}

module.exports = new questionGameController()

