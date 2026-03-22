const uuid = require('uuid')
const path = require('path')
const fs = require('fs')
const ApiError = require('../error/ApiError')
const { Image } = require('../models/index')
const validateCheck = require('../validators/isNullValidator')
class imageController {
    async create(req, res, next) {
        try {
            const image = req.files.image;

            if (!image) {
                return next(ApiError.badRequest('Файлы не загружены'));
            }

            const fileId = uuid.v4();
            const fileName = `${fileId}.jpg`;
            const savePath = path.resolve(__dirname, '..', 'static', fileName);
            try {
                await image.mv(savePath);
            } catch (error) {
                return next(ApiError.badRequest(`Ошибка сохранения файла ${image.name}: ${error.message}`));
            }

            const imageData = await Image.create({ id: fileId });
            res.json({ message: 'Изображение добавлено', data: imageData });
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка создания: ${error.message}`));
        }
    }

    async getAll(req, res, next) {
        try {
            const images = await Image.findAll()
            res.json(images)
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка получения: ${error.message}`))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            validateCheck(!id, 'Не задан id изображения')
            const isDelete = await Image.destroy({
                where: {
                    id: id,
                },
            })
            validateCheck(!isDelete, 'Изображение не найдено')
            fs.unlinkSync(path.resolve(__dirname, '..', 'static', id + '.jpg'))
            res.json({ message: 'Изображение удалено' })
        } catch (error) {
            return next(ApiError.badRequest(`Ошибка удаления: ${error.message}`))
        }
    }
}

module.exports = new imageController()
