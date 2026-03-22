const ApiError = require('../error/ApiError');
const { SecurityEvent } = require('../models');

class SecurityEventController {
  async getAll(req, res, next) {
    try {
      const limit = Math.min(Number(req.query.limit) || 200, 1000);
      const events = await SecurityEvent.findAll({
        order: [['createdAt', 'DESC']],
        limit,
      });

      res.json(events);
    } catch (error) {
      return next(ApiError.badRequest(`Ошибка получения аудита: ${error.message}`));
    }
  }
}

module.exports = new SecurityEventController();
