const ApiError = require('../error/ApiError')
const { AccessGame } = require('../models/index')
const validateCheck = require('../validators/isNullValidator')

class accessGameController {
    async createForGame(accessGame, transaction) {
        await AccessGame.bulkCreate(accessGame, { transaction })
    }
    async create(req, res, next) {
        try {
            const { roleId, gameId } = req.body
            const isAccessGame = await AccessGame.findOne({
                where: {
                    roleId: roleId,
                    gameId: gameId,
                },
                attributes: ['id']
            })
            validateCheck(isAccessGame, 'Доступ роли к игре уже существует!')
            const accessGameData = await AccessGame.create({ roleId, gameId })
            res.json({ message: 'Доступ роли к игре добавлен', accessGameData })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка создания: ${error.message}`))
        }
    }

    async getAll(req, res, next) {
        try {
            const accessGames = await AccessGame.findAll()
            res.json(accessGames)
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка получения: ${error.message}`))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id доступа роли к игре')
            const isDelete = await AccessGame.destroy({
                where: {
                    id: id,
                },
            })
            validateCheck(!isDelete, 'Доступ роли к игре не найден')
            res.json({ message: 'Доступ роли к игре удален' })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка удаления: ${error.message}`))
        }
    }
}

module.exports = new accessGameController()

