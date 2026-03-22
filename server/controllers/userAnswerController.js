const { Sequelize } = require('sequelize')
const ApiError = require('../error/ApiError')
const { UserAnswer, User, QuestionGame, Question, Game, Bonus, CarouselData } = require('../models/index')
const validateCheck = require('../validators/isNullValidator')
const ratingController = require('./ratingController')


const BONUS = {
    'row': {
        '1': 50,
        '2': 50,
        '3': 50,
        '4': 50,
        '5': 50
    },
    'column': {
        '1': 10,
        '2': 20,
        '3': 30,
        '4': 40,
        '5': 50
    }
}


class userAnswerController {
    async create(req, res, next) {
        try {
            let { questionGameId, userAnswer } = req.body
            userAnswer = userAnswer.trim().toLowerCase()
            const [{ typeGame }, questionData] = await Promise.all([
                Game.findByPk(req.params.id, { attributes: ["typeGame"] }),
                QuestionGame.findOne({
                    attributes: ["numberQuestion"],
                    include: [{
                        model: Question,
                        attributes: ['id', 'answer'],
                        required: true
                    }, {
                        model: UserAnswer,
                        attributes: ['id'],
                        required: false,
                        where: {
                            questionGameId,
                            userId: req.user.id
                        }
                    }],
                    where: { id: questionGameId }
                })
            ])
            validateCheck(questionData.userAnswers.length, 'Ответ был дан ранее!')

            const { answer } = questionData.question
            let isCorrect = answer === userAnswer ? true : false
            let points

            if (typeGame === 'carousel') {
                //Высчитывание баллов за вопрос по правилам математической карусели
                points = await this.answerCarousel(questionData.numberQuestion, req)
            }

            let bonuses
            if (typeGame === 'square') {
                //Высчитывание баллов за вопрос и бонусов по правилам математического квадрата
                ({ points, bonuses } = await this.answerSquare(isCorrect, questionData, req))
            }

            //Сохранение ответа
            await UserAnswer.create({ questionGameId, userId: req.user.id, points, userAnswer, isCorrect })
            res.json({ message: 'Ответ добавлен', isCorrect, bonuses })
        } catch (error) {
            return next(ApiError.badRequest(`${error.message}`))
        }
    }

    async answerCarousel(number, req) {
        const countAnswer = await UserAnswer.count({
            include: [{
                model: QuestionGame,
                attributes: [],
                required: true,
                where: {
                    gameId: req.params.id
                }
            }],
            where: {
                userId: req.user.id,
            }
        })
        //Проверяет, что пользователь отвечает на следующий вопрос
        if (countAnswer !== number - 1) {
            throw new Error('Ошибка отправки ответа. Сперва ответьте на предыдущий вопрос.')
        }
        const caruselData = await CarouselData.findOne({
            where: {
                gameId: req.params.id,
            }
        })
        let points
        if (countAnswer === 0) {
            points = caruselData.scoreFirst
        }
        else {
            const preDataAnswer = await UserAnswer.findOne({
                attributes: ['points', 'isCorrect'],
                include: [{
                    model: QuestionGame,
                    attributes: [],
                    required: true,
                    where: {
                        gameId: req.params.id,
                        numberQuestion: countAnswer
                    }
                }],
                where: {
                    userId: req.user.id,
                }
            })
            if (preDataAnswer.isCorrect) {
                points = preDataAnswer.points + caruselData.scoreSuccess
            }
            else {
                if (preDataAnswer.points - caruselData.scoreFailure >= caruselData.scoreFirst) {
                    points = preDataAnswer.points - caruselData.scoreFailure
                }
                else {
                    points = caruselData.scoreFirst
                }
            }
        }
        return points
    }

    async answerSquare(isCorrect, questionData, req) {
        let bonuses = []
        const row = Math.ceil(questionData.numberQuestion / 5)
        const column = (questionData.numberQuestion - 1) % 5 + 1
        const points = BONUS['column'][`${column}`]
        if (isCorrect) {
            const checks = await Promise.all([
                this.check(req, '("questionGame"."numberQuestion" - 1) / 5 + 1'),
                this.check(req, '("questionGame"."numberQuestion" - 1) % 5 + 1')
            ])
            let insert_data
            if (checks[0].includes(row)) {
                insert_data = { points: BONUS['row'][`${row}`], type: 'row', lvl: row }
                await Bonus.create({ ...insert_data, userId: req.user.id, gameId: req.params.id })
                bonuses.push(insert_data)
            }
            if (checks[1].includes(column)) {
                insert_data = { points: BONUS['column'][`${column}`], type: 'column', lvl: column }
                await Bonus.create({ ...insert_data, userId: req.user.id, gameId: req.params.id })
                bonuses.push(insert_data)
            }
        }
        return { points, bonuses }
    }

    async getAll(req, res, next) {
        try {
            const gamesData = await UserAnswer.findAll({
                attributes: { exclude: ['gameId', 'userId', 'questionGameId'] },
                include: [{
                    model: User,
                    attributes: { exclude: ['password'] },
                    required: false
                },
                {
                    model: QuestionGame,
                    attributes: ['id'],
                    required: false,
                    include: [{
                        model: Game,
                        attributes: ['id', 'typeGame', 'name'],
                        required: false
                    }]
                }]
            })
            res.json(gamesData)
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка получения: ${error.message}`))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id ответа пользователя!')
            const isDelete = await UserAnswer.destroy({
                where: {
                    id: id,
                },
            })
            validateCheck(!isDelete, 'Ответ пользователя не найден!')
            res.json({ message: 'Ответ пользователя удален' })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка удаления: ${error.message}`))
        }
    }

    async download(req, res, next) {
        try {
            let { typeGame, name, startDate, endDate } = await Game.findByPk(req.params.id, { attributes: ["typeGame", "name", "startDate", "endDate"] })
            const { countQuestion, rating } = await ratingController.getRatingPrivate(req.params.id, typeGame, req.query.userId)

            startDate.setHours(startDate.getHours() + 3)
            endDate.setHours(endDate.getHours() + 3)
            startDate = startDate.toISOString().slice(0, 19).replace(/:/g, '-')
            endDate = endDate.toISOString().slice(0, 19).replace(/:/g, '-')

            // Имя файла
            const fileName = `${typeGame}_${startDate}_${endDate}_${name}.xlsx`

            // Создание массива данных для Excel
            let excelData = []

            // Строка с номерами вопросов
            let questionNumbers = ['Номер']
            for (let i = 1; i <= countQuestion; i++) {
                questionNumbers.push(i) // Номера вопросов
            }

            // Формирование данных ответов пользователя
            rating.forEach(item => {
                excelData.push(["Пользователь", item.username])
                excelData.push(questionNumbers)

                let answerPoints = ["Баллы"]
                // Перебираем все вопросы
                for (let i = 1; i <= countQuestion; i++) {
                    // Ищем ответ пользователя на данный вопрос
                    let userAnswer = item.userAnswers.find(answer => answer.numberQuestion === i)
                    if (userAnswer?.isCorrect) {
                        // Lобавляем баллы за верный ответ
                        answerPoints.push(userAnswer.points)
                    } else {
                        // Если ответа нет или неверный, ставим 0
                        answerPoints.push(0)
                    }
                }

                excelData.push(answerPoints)
                if (typeGame === "square") {
                    excelData.push(["Сумма баллов за вопросы", item.pointsAnswer])
                    excelData.push(["Бонусы", item.pointsBonuses])
                }
                excelData.push(["Всего баллов", item.totalPoints])
                excelData.push([])
            });

            res.json({ fileName: fileName, excelData: excelData })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка скачивания: ${error.message}`))
        }
    }

    async check(req, query) {
        const rows = await UserAnswer.findAll({
            attributes: [
                [Sequelize.literal(query), 'number'],
                [Sequelize.fn('COUNT', Sequelize.col('userAnswer.isCorrect')), 'correct_count']
            ],
            include: [{
                model: QuestionGame,
                attributes: [],
                where: {
                    gameId: req.params.id
                }
            }],
            where: {
                userId: req.user.id,
                isCorrect: true
            },
            group: [Sequelize.literal('number')],
            having: Sequelize.literal('COUNT("userAnswer"."isCorrect") = 4')
        });

        return rows.map(row => row.dataValues.number);
    }
}

module.exports = new userAnswerController()