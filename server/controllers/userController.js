const argon2 = require('argon2')
const ApiError = require('../error/ApiError')
const { User, Role } = require('../models/index')
const validateCheck = require('../validators/isNullValidator')
const generateHashPassword = require('../utils/generateHashPassword')
const generateJwt = require('../utils/generateJwt')

function errorHandling(error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        error.message = 'Пользователь с таким именем уже существует!'
    }
}

class UserController {
    async createUser(req, res, next) {
        try {
            let { username, password, roleId } = req.body
            const role = (await Role.findByPk(roleId, { attributes: ['name'] }))?.dataValues.name
            if (!role) {
                roleId = 'aff50f23-2fbc-41be-ba07-c1c69c5e388c' //UUID роли USER
            }
            const hashPassword = await generateHashPassword(password)
            await User.create({ username, password: hashPassword, roleId })
            return res.json({ message: "Пользователь создан!" })
        } catch (error) {
            errorHandling(error)
            return next(ApiError.badRequest(`Ошибка регистрации: ${error.message}`))
        }
    }
    async signup(req, res, next) {
        try {
            const { username, password } = req.body
            const hashPassword = await generateHashPassword(password)
            const user = await User.create({ username, password: hashPassword })
            const token = generateJwt(user.id, user.username, "USER")
            return res.json({ token })
        } catch (error) {
            errorHandling(error)
            return next(ApiError.badRequest(`Ошибка регистрации: ${error.message}`))
        }
    }

    async signin(req, res, next) {
        try {
            const { username, password } = req.body
            const user = await User.findOne({ where: { username } })
            validateCheck(!user, 'Пользователь с таким именем не найден!')
            let comparePassword = await argon2.verify(user.password, password)
            validateCheck(!comparePassword, 'Указан неверный пароль!')
            const role = (await Role.findByPk(user.roleId, { attributes: { exclude: ['id'] } }))?.dataValues.name
            const token = generateJwt(user.id, user.username, role)
            return res.json({ token })
        } catch (error) {
            return next(ApiError.unauthorized(`Ошибка входа: ${error.message}`))
        }
    }

    async check(req, res, next) {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: ['roleId'],
                rejectOnEmpty: true
            });
            const role = await Role.findByPk(user.roleId, {
                attributes: ['name'],
                rejectOnEmpty: true
            });
            const token = generateJwt(
                req.user.id,
                req.user.username,
                role.name
            )
            res.json({ token })
        } catch {
            return next(ApiError.unauthorized('Токен устарел'))
        }
    }

    async getAll(req, res, next) {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password', 'roleId'] },
                include: [{
                    model: Role,
                    required: false
                }]
            })
            res.json(users)
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка получения: ${error.message}`))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id пользователя')
            if (id === req.user.id) {
                throw new Error('Нельзя удалить самого себя!')
            }
            const isDelete = await User.destroy({
                where: {
                    id: id,
                },
            })
            validateCheck(!isDelete, 'Пользователь не найден')
            res.json({ message: 'Пользователь удален' })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка удаления: ${error.message}`))
        }
    }

    async updateUser(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id пользователя')
            const { username, password, roleId } = req.body;
            const hashPassword = password && await generateHashPassword(password)
            const isUpdate = await User.update(
                {
                    username: username,
                    ...(hashPassword && { password: hashPassword }),
                    roleId: roleId
                },
                {
                    where: {
                        id: id,
                    }
                }
            );
            validateCheck(!isUpdate[0], 'Пользователь не найден')
            res.json({ message: 'Данные пользователя обновлены' });
        } catch (error) {
            errorHandling(error)
            return next(ApiError.badRequest(`Ошибка обновления: ${error.message}`))
        }
    }

    async update(req, res, next) {
        try {
            const id = req.user.id
            const { username, password } = req.body;
            const hashPassword = password && await generateHashPassword(password)
            const isUpdate = await User.update(
                {
                    ...(username && { username: username }),
                    password: hashPassword
                },
                {
                    where: {
                        id: id,
                    }
                }
            );
            validateCheck(!isUpdate[0], 'Пользователь не найден')
            const token = generateJwt(req.user.id, username, req.user.role)
            res.json({ message: 'Данные пользователя обновлены', token: token });
        } catch (error) {
            errorHandling(error)
            return next(ApiError.badRequest(`Ошибка обновления: ${error.message}`))
        }
    }
}

module.exports = new UserController()