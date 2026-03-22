const { Game, InvadersData } = require('../models');

class MathInvadersService {
  constructor() {
    this.games = new Map();
    this.startPositions = [
      { x: 0, y: 0 },
      { x: 0, y: 4 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
    ];
  }

  async getOrCreateGame(gameId) {
    if (this.games.has(gameId)) {
      return this.games.get(gameId);
    }

    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: InvadersData,
          required: false,
        },
      ],
    });

    if (!game) {
      throw new Error('Игра не найдена');
    }

    const classLevel = Number(game?.invadersData?.schoolClass || 6);
    const state = {
      gameId,
      classLevel,
      players: [],
      grid: this.createGrid(classLevel),
      currentPlayerIndex: 0,
      activePlayerId: null,
      gameOver: false,
      winner: null,
      lastMovedCell: null,
      currentAttemptCost: 0,
      pendingAttempt: null,
    };

    this.games.set(gameId, state);
    return state;
  }

  createGrid(classLevel) {
    return Array.from({ length: 5 }, (_, x) =>
      Array.from({ length: 5 }, (_, y) => {
        const difficulty = this.randomInt(1, 3);
        const task = this.generateTask(classLevel, difficulty);

        return {
          x,
          y,
          task: task.task,
          answer: task.answer,
          difficulty,
          cost: difficulty,
          originalCost: difficulty,
          ownerId: null,
          isRevealed: false,
        };
      })
    );
  }

  async joinGame(gameId, user) {
    const state = await this.getOrCreateGame(gameId);
    let player = state.players.find((item) => item.id === user.id);

    if (!player) {
      if (state.players.length >= 4) {
        throw new Error('Матч уже заполнен');
      }

      const start = this.startPositions[state.players.length];
      player = {
        id: user.id,
        name: user.username,
        x: start.x,
        y: start.y,
        coins: 10,
        capturedCells: 0,
        isReady: false,
      };
      state.players.push(player);
    }

    return this.toDto(state, user.id);
  }

  async setReady(gameId, userId, isReady = true) {
    const state = await this.getOrCreateGame(gameId);
    const player = this.getPlayer(state, userId);
    player.isReady = Boolean(isReady);

    const allReady = state.players.length >= 2 && state.players.every((item) => item.isReady);
    if (allReady && !state.activePlayerId) {
      state.activePlayerId = state.players[0].id;
      state.currentPlayerIndex = 0;

      state.players.forEach((item) => {
        const startCell = state.grid[item.x][item.y];
        if (!startCell.ownerId) {
          startCell.ownerId = item.id;
          startCell.isRevealed = true;
          item.capturedCells = 1;
        }
      });
    }

    return {
      allReady,
      state: this.toDto(state, userId),
    };
  }

  async getState(gameId, userId) {
    const state = await this.getOrCreateGame(gameId);
    this.getPlayer(state, userId);
    return this.toDto(state, userId);
  }

  async move(gameId, userId, newX, newY) {
    const state = await this.getOrCreateGame(gameId);
    this.ensureGameActive(state);
    this.ensureTurnStarted(state);
    this.ensurePlayerTurn(state, userId);
    this.ensureNoPendingAttempt(state);

    const player = this.getPlayer(state, userId);

    if (!this.canMove(player, newX, newY)) {
      throw new Error('Нельзя туда пойти!');
    }

    state.lastMovedCell = { x: player.x, y: player.y };
    player.x = newX;
    player.y = newY;

    const cell = state.grid[newX][newY];
    if (cell.ownerId && cell.ownerId !== player.id) {
      return {
        success: true,
        isOccupied: true,
        doubleCost: cell.originalCost * 2,
        originalCost: cell.originalCost,
        state: this.toDto(state, userId),
      };
    }

    return {
      success: true,
      cost: cell.cost,
      state: this.toDto(state, userId),
    };
  }

  async spendCoins(gameId, userId, spend) {
    const state = await this.getOrCreateGame(gameId);
    this.ensureGameActive(state);
    this.ensureTurnStarted(state);
    this.ensurePlayerTurn(state, userId);
    this.ensureNoPendingAttempt(state);

    const player = this.getPlayer(state, userId);
    const cell = state.grid[player.x][player.y];

    if (cell.ownerId) {
      throw new Error('Эта клетка уже занята.');
    }

    if (spend) {
      if (player.coins < cell.cost) {
        throw new Error('Недостаточно монет!');
      }

      player.coins -= cell.cost;
      cell.isRevealed = true;
      state.currentAttemptCost = cell.cost;
      state.pendingAttempt = {
        playerId: userId,
        x: player.x,
        y: player.y,
        mode: 'spend',
        cost: cell.cost,
      };

      return {
        success: true,
        task: cell.task,
        timeLimit: 30,
        state: this.toDto(state, userId),
      };
    }

    this.finishTurn(state);

    return {
      success: true,
      state: this.toDto(state, userId),
    };
  }

  async captureCell(gameId, userId, useOriginalTask) {
    const state = await this.getOrCreateGame(gameId);
    this.ensureGameActive(state);
    this.ensureTurnStarted(state);
    this.ensurePlayerTurn(state, userId);
    this.ensureNoPendingAttempt(state);

    const player = this.getPlayer(state, userId);
    const cell = state.grid[player.x][player.y];

    if (!cell.ownerId || cell.ownerId === player.id) {
      throw new Error('Эта клетка не принадлежит другому игроку!');
    }

    const cost = useOriginalTask ? cell.originalCost * 2 : cell.originalCost;
    if (player.coins < cost) {
      throw new Error('Недостаточно монет!');
    }

    player.coins -= cost;
    cell.isRevealed = true;
    state.currentAttemptCost = cost;
    state.pendingAttempt = {
      playerId: userId,
      x: player.x,
      y: player.y,
      mode: useOriginalTask ? 'capture-double' : 'capture-hard',
      cost,
    };

    if (!useOriginalTask) {
      const task = this.generateTask(state.classLevel, cell.difficulty + 1);
      cell.task = task.task;
      cell.answer = task.answer;
    }

    return {
      success: true,
      task: cell.task,
      timeLimit: 30,
      state: this.toDto(state, userId),
    };
  }

  async submitAnswer(gameId, userId, answer) {
    const state = await this.getOrCreateGame(gameId);
    this.ensureGameActive(state);
    this.ensureTurnStarted(state);
    this.ensurePendingAttemptForPlayer(state, userId);

    const player = this.getPlayer(state, userId);
    const { x, y } = state.pendingAttempt;
    const cell = state.grid[x][y];
    const isCorrect = Number(answer) === Number(cell.answer);

    if (isCorrect) {
      if (cell.ownerId && cell.ownerId !== player.id) {
        const previousOwner = state.players.find((item) => item.id === cell.ownerId);
        if (previousOwner && previousOwner.capturedCells > 0) {
          previousOwner.capturedCells -= 1;
        }
      }

      if (cell.ownerId !== player.id) {
        cell.ownerId = player.id;
        player.capturedCells += 1;
      }

      state.lastMovedCell = null;
      state.currentAttemptCost = 0;
      state.pendingAttempt = null;
      this.checkGameOver(state);

      if (!state.gameOver) {
        this.finishTurn(state);
      }
    } else {
      this.rollbackFailedAttempt(state, player, cell);
    }

    return {
      success: true,
      wasCorrect: isCorrect,
      state: this.toDto(state, userId),
    };
  }

  async timeout(gameId, userId) {
    const state = await this.getOrCreateGame(gameId);
    this.ensureGameActive(state);
    this.ensureTurnStarted(state);
    this.ensurePendingAttemptForPlayer(state, userId);

    const player = this.getPlayer(state, userId);
    const { x, y } = state.pendingAttempt;
    const cell = state.grid[x][y];

    this.rollbackFailedAttempt(state, player, cell);

    return {
      success: true,
      message: 'Время вышло!',
      state: this.toDto(state, userId),
    };
  }

  rollbackFailedAttempt(state, player, cell) {
    if (state.lastMovedCell) {
      player.x = state.lastMovedCell.x;
      player.y = state.lastMovedCell.y;
    }

    cell.isRevealed = false;
    const task = this.generateTask(state.classLevel, cell.difficulty);
    cell.task = task.task;
    cell.answer = task.answer;
    state.lastMovedCell = null;
    state.currentAttemptCost = 0;
    state.pendingAttempt = null;
    this.finishTurn(state);
  }

  canMove(player, newX, newY) {
    if (newX < 0 || newX >= 5 || newY < 0 || newY >= 5) {
      return false;
    }

    const dx = Math.abs(player.x - newX);
    const dy = Math.abs(player.y - newY);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  checkGameOver(state) {
    const totalCells = state.grid.length * state.grid[0].length;
    const threshold = Math.ceil(totalCells / 2);

    const leader = state.players.find((player) => player.capturedCells >= threshold);
    if (leader) {
      state.gameOver = true;
      state.winner = `${leader.name} победил!`;
      return;
    }

    const allCellsCaptured = state.grid.every((row) => row.every((cell) => Boolean(cell.ownerId)));
    if (allCellsCaptured) {
      state.gameOver = true;
      const winner = [...state.players].sort((a, b) => b.capturedCells - a.capturedCells)[0];
      state.winner = `${winner.name} победил с ${winner.capturedCells} клетками!`;
    }
  }

  finishTurn(state) {
    if (!state.players.length) {
      state.activePlayerId = null;
      state.currentPlayerIndex = 0;
      return;
    }

    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    state.activePlayerId = state.players[state.currentPlayerIndex].id;
  }

  generateTask(classLevel, difficulty) {
    const level = Number(classLevel);
    const tier = Math.max(1, Number(difficulty));

    if (tier >= 3) {
      return this.generateHardTask(level);
    }

    switch (level) {
      case 6:
        return this.generateClass6Task(tier);
      case 7:
        return this.generateClass7Task(tier);
      case 8:
        return this.generateClass8Task(tier);
      default:
        return this.generateFallbackTask(tier);
    }
  }

  generateClass6Task(tier) {
    const a = this.randomInt(10, tier === 1 ? 40 : 70);
    const b = this.randomInt(5, tier === 1 ? 20 : 30);
    const c = this.randomInt(2, 9);
    const variant = this.randomInt(0, 3);

    switch (variant) {
      case 0:
        return { task: `${a} + ${b} = ?`, answer: a + b };
      case 1:
        return { task: `${a} - ${b} = ?`, answer: a - b };
      case 2:
        return { task: `${a} * ${c} = ?`, answer: a * c };
      default:
        return { task: `${a * c} / ${c} = ?`, answer: a };
    }
  }

  generateClass7Task(tier) {
    const a = this.randomInt(20, tier === 1 ? 90 : 140);
    const b = this.randomInt(10, tier === 1 ? 40 : 70);
    const c = this.randomInt(2, 12);
    const variant = this.randomInt(0, 3);

    switch (variant) {
      case 0:
        return { task: `${a} + ${b} - ${c} = ?`, answer: a + b - c };
      case 1:
        return { task: `${a} - ${b} + ${c} = ?`, answer: a - b + c };
      case 2:
        return { task: `${a} * ${c} + ${b} = ?`, answer: a * c + b };
      default:
        return { task: `${a * c} / ${c} - ${b} = ?`, answer: a - b };
    }
  }

  generateClass8Task(tier) {
    const a = this.randomInt(3, 12);
    const b = this.randomInt(2, 10);
    const c = this.randomInt(5, tier === 1 ? 20 : 40);
    const x = this.randomInt(2, 12);
    const variant = this.randomInt(0, 3);

    switch (variant) {
      case 0:
        return { task: `${a}x + ${c} = ${a * x + c}. Найдите x`, answer: x };
      case 1:
        return { task: `${a}(x - ${b}) = ${a * (x - b)}. Найдите x`, answer: x };
      case 2:
        return { task: `${a * x} / ${a} + ${b} = ?`, answer: x + b };
      default:
        return { task: `(${a} + ${b}) * ${c} = ?`, answer: (a + b) * c };
    }
  }

  generateHardTask(level) {
    const x = this.randomInt(2, 12);

    if (level === 8) {
      const a = this.randomInt(2, 6);
      const b = this.randomInt(1, 9);
      return {
        task: `${a}x - ${b} = ${a * x - b}. Найдите x`,
        answer: x,
      };
    }

    const a = this.randomInt(10, 60);
    const b = this.randomInt(2, 12);
    const c = this.randomInt(5, 40);
    const variant = this.randomInt(0, 2);

    switch (variant) {
      case 0:
        return { task: `${a} + ${b} * ${c} = ?`, answer: a + b * c };
      case 1:
        return { task: `${b} * ${x} + ${c} = ?`, answer: b * x + c };
      default:
        return { task: `${a} * ${b} - ${c} = ?`, answer: a * b - c };
    }
  }

  generateFallbackTask(tier) {
    const a = this.randomInt(1, 10 * tier);
    const b = this.randomInt(1, 10 * tier);
    return { task: `${a} + ${b} = ?`, answer: a + b };
  }

  getPlayer(state, userId) {
    const player = state.players.find((item) => item.id === userId);
    if (!player) {
      throw new Error('Игрок не найден!');
    }
    return player;
  }

  ensureGameActive(state) {
    if (state.gameOver) {
      throw new Error('Игра окончена!');
    }
  }

  ensureTurnStarted(state) {
    if (!state.activePlayerId) {
      throw new Error('Игра начнётся, когда будут готовы минимум два игрока.');
    }
  }

  ensurePlayerTurn(state, userId) {
    if (state.activePlayerId !== userId) {
      throw new Error('Сейчас ход другого игрока.');
    }
  }

  ensureNoPendingAttempt(state) {
    if (state.pendingAttempt) {
      throw new Error('Сначала завершите текущую задачу.');
    }
  }

  ensurePendingAttemptForPlayer(state, userId) {
    if (!state.pendingAttempt || state.pendingAttempt.playerId !== userId) {
      throw new Error('У вас нет активной задачи.');
    }
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  toDto(state, playerId) {
    return {
      matchId: state.gameId,
      players: state.players.map((player) => ({ ...player })),
      grid: state.grid.map((row) =>
        row.map((cell) => ({
          x: cell.x,
          y: cell.y,
          difficulty: cell.difficulty,
          cost: cell.cost,
          originalCost: cell.originalCost,
          ownerId: cell.ownerId,
          isRevealed: cell.isRevealed,
        }))
      ),
      classLevel: state.classLevel,
      currentPlayerIndex: state.currentPlayerIndex,
      activePlayerId: state.activePlayerId,
      gameOver: state.gameOver,
      winner: state.winner,
      lastMovedCell: state.lastMovedCell,
      currentAttemptCost: state.currentAttemptCost,
      pendingAttempt: state.pendingAttempt
        ? {
            playerId: state.pendingAttempt.playerId,
            x: state.pendingAttempt.x,
            y: state.pendingAttempt.y,
            mode: state.pendingAttempt.mode,
            cost: state.pendingAttempt.cost,
          }
        : null,
      playerId,
    };
  }
}

module.exports = new MathInvadersService();
