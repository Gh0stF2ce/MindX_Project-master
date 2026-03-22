const mathInvadersService = require('../services/mathInvadersService');
const ApiError = require('../error/ApiError');

class MathInvadersController {
  async join(req, res, next) {
    try {
      const state = await mathInvadersService.joinGame(req.params.id, req.user);
      return res.json({ success: true, state });
    } catch (error) {
      return next(ApiError.badRequest(error.message));
    }
  }

  async ready(req, res, next) {
    try {
      const { isReady = true } = req.body || {};
      const result = await mathInvadersService.setReady(req.params.id, req.user.id, isReady);
      return res.json({ success: true, ...result });
    } catch (error) {
      return next(ApiError.badRequest(error.message));
    }
  }

  async state(req, res, next) {
    try {
      const state = await mathInvadersService.getState(req.params.id, req.user.id);
      return res.json({ success: true, state });
    } catch (error) {
      return next(ApiError.badRequest(error.message));
    }
  }

  async move(req, res, next) {
    try {
      const { newX, newY } = req.body;
      const result = await mathInvadersService.move(req.params.id, req.user.id, newX, newY);
      return res.json(result);
    } catch (error) {
      return next(ApiError.badRequest(error.message));
    }
  }

  async spend(req, res, next) {
    try {
      const { spend } = req.body;
      const result = await mathInvadersService.spendCoins(req.params.id, req.user.id, spend);
      return res.json(result);
    } catch (error) {
      return next(ApiError.badRequest(error.message));
    }
  }

  async capture(req, res, next) {
    try {
      const { useOriginalTask } = req.body;
      const result = await mathInvadersService.captureCell(req.params.id, req.user.id, useOriginalTask);
      return res.json(result);
    } catch (error) {
      return next(ApiError.badRequest(error.message));
    }
  }

  async answer(req, res, next) {
    try {
      const { answer } = req.body;
      const result = await mathInvadersService.submitAnswer(req.params.id, req.user.id, answer);
      return res.json(result);
    } catch (error) {
      return next(ApiError.badRequest(error.message));
    }
  }

  async timeout(req, res, next) {
    try {
      const result = await mathInvadersService.timeout(req.params.id, req.user.id);
      return res.json(result);
    } catch (error) {
      return next(ApiError.badRequest(error.message));
    }
  }
}

module.exports = new MathInvadersController();
