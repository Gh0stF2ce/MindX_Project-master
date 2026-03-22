const ApiError = require('../error/ApiError')
const { Theme } = require('../models/index')
const validateCheck = require('../validators/isNullValidator')

function errorHandling(error, msg) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        error.message = `Тема '${error.fields.name}' дублируется! Отменена ${msg} записей!`
    }
}

class themeController {
    async create(req, res, next) {
        try {
            const { name } = req.body
            const themesData = await Theme.create({ name })
            res.json({ message: 'Тема добавлена', themesData })
        } catch (error) {
            errorHandling(error, 'вставки')
            return next(ApiError.badRequest(`Ошибка создания: ${error.message}`))
        }
    }

    async getAll(req, res, next) {
        try {
            const themes = await Theme.findAll()
            res.json(themes)
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка получения: ${error.message}`))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id темы')
            const isDelete = await Theme.destroy({
                where: {
                    id: id,
                },
            })
            validateCheck(!isDelete, 'Тема не найдена')
            res.json({ message: 'Тема удалена' })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка удаления: ${error.message}`))
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id темы')
            const { name } = req.body;
            const isUpdate = await Theme.update(
                {
                    name: name,
                },
                {
                    where: {
                        id: id,
                    }
                }
            );
            validateCheck(!isUpdate[0], 'Тема не найдена')
            res.json({ message: 'Тема обновлена' });
        } catch (error) {
            errorHandling(error, 'обновления')
            return next(ApiError.badRequest(`Ошибка обновления: ${error.message}`))
        }
    }
}

module.exports = new themeController()

