const { Op } = require('sequelize')
const ApiError = require('../error/ApiError')
const { Role } = require('../models/index')
const validateCheck = require('../validators/isNullValidator')

function errorHandling(error, msg) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        error.message = `Роль '${error.fields.name}' дублируется! Отменена ${msg} записей!`
    }
}

class roleController {
    async create(req, res, next) {
        try {
            const { name } = req.body
            const roleData = await Role.create({ name })
            res.json({ message: 'Роль добавлена', roleData })
        } catch (error) {
            errorHandling(error, 'вставки')
            return next(ApiError.badRequest(`Ошибка создания: ${error.message}`))
        }
    }

    async getAll(req, res, next) {
        try {
            const roles = await Role.findAll()
            res.json(roles)
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка получения: ${error.message}`))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id роли')
            const isDelete = await Role.destroy({
                where: {
                    id: id,
                    name: {
                        [Op.notIn]: ['USER', 'ADMIN'],
                    }
                },
            })
            validateCheck(!isDelete, 'Роль не найдена')
            res.json({ message: 'Роль удалена' })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка удаления: ${error.message}`))
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id роли')
            const { name } = req.body;
            const isUpdate = await Role.update(
                {
                    name: name,
                },
                {
                    where: {
                        id: id,
                        name: {
                            [Op.notIn]: ['USER', 'ADMIN'],
                        }
                    }
                }
            );
            validateCheck(!isUpdate[0], 'Роль не найдена')
            res.json({ message: 'Роль обновлена' });
        } catch (error) {
            errorHandling(error, 'обновления')
            return next(ApiError.badRequest(`Ошибка обновления: ${error.message}`))
        }
    }
}

module.exports = new roleController()

