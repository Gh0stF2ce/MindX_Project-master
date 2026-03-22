const { InvadersData } = require('../models')

class InvadersDataController {
  async createForGame(invadersData, transaction) {
    if (invadersData) {
      await InvadersData.create(invadersData, { transaction })
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params
      const data = await InvadersData.findByPk(id)
      if (!data) return res.status(404).json({ message: 'Данные не найдены' })
      await data.update(req.body)
      return res.json(data)
    } catch (e) { next(e) }
  }

  async getAll(req, res) {
    const data = await InvadersData.findAll()
    return res.json(data)
  }

  async getOne(req, res) {
    const { id } = req.params
    const data = await InvadersData.findOne({ where: { gameId: id } })
    return res.json(data || null)
  }
}

module.exports = new InvadersDataController()
