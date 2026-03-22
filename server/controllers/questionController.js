const ApiError = require('../error/ApiError')
const { Question } = require('../models/index')
const validateCheck = require('../validators/isNullValidator')

function errorHandling(error, msg) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        error.message = `Вопрос '${error.fields.question}' дублируется! Отменена ${msg} записей!`
    }
}

class questionController {
    async create(req, res, next) {
        try {
            let { question, answer, imageId } = req.body
            answer = answer.trim().toLowerCase()
            const questionsData = await Question.create({ question, answer, imageId })
            res.json({ message: 'Вопрос добавлен', questionsData })
        } catch (error) {
            errorHandling(error, 'вставки')
            return next(ApiError.badRequest(`Ошибка создания: ${error.message}`))
        }
    }

    async getAll(req, res, next) {
        try {
            const questions = await Question.findAll()
            res.json(questions)
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка получения: ${error.message}`))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id вопроса')
            const isDelete = await Question.destroy({
                where: {
                    id: id,
                },
            })
            validateCheck(!isDelete, 'Вопрос не найден')
            res.json({ message: 'Вопрос удален' })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка удаления: ${error.message}`))
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id вопроса')
            let { question, answer, imageId } = req.body;
            answer = answer.trim().toLowerCase()
            const isUpdate = await Question.update(
                {
                    question: question,
                    answer: answer,
                    imageId: imageId
                },
                {
                    where: {
                        id: id,
                    }
                }
            );
            validateCheck(!isUpdate[0], 'Вопрос не найден')
            res.json({ message: 'Вопрос обновлен' });
        } catch (error) {
            errorHandling(error, 'обновления')
            return next(ApiError.badRequest(`Ошибка обновления: ${error.message}`))
        }
    }
}

module.exports = new questionController()
