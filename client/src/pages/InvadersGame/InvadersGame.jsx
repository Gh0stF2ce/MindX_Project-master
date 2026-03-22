import './invadersgame.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { API } from '@mindx/http/API';
import BlockingWindow from '@mindx/components/BlockingWindow/BlockingWindow';
import Loading from '@mindx/components/UI/Loading/Loading';
import { ErrorEmmiter, SuccessEmmiter } from '@mindx/components/UI/Toastify/Notify';

const TASK_TIME_LIMIT = 30;

const InvadersGame = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState('');
  const [gameInfo, setGameInfo] = useState(null);
  const [state, setState] = useState(null);
  const [answer, setAnswer] = useState('');
  const [timer, setTimer] = useState(TASK_TIME_LIMIT);
  const [taskModal, setTaskModal] = useState({
    open: false,
    task: '',
    mode: '',
  });
  const [actionModal, setActionModal] = useState({
    open: false,
    type: '',
    payload: null,
  });

  const pollRef = useRef(null);
  const timerRef = useRef(null);

  const currentPlayer = useMemo(
    () => state?.players?.find((item) => item.id === state?.playerId) || null,
    [state]
  );

  const activePlayer = useMemo(
    () => state?.players?.find((item) => item.id === state?.activePlayerId) || null,
    [state]
  );

  const allReady = useMemo(
    () => Boolean(state?.players?.length >= 2 && state?.players?.every((item) => item.isReady)),
    [state]
  );

  const isMyTurn = currentPlayer?.id && currentPlayer.id === state?.activePlayerId;

  const updateState = (nextState) => {
    if (nextState) {
      setState(nextState);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const closeTaskModal = () => {
    stopTimer();
    setTaskModal({ open: false, task: '', mode: '' });
    setAnswer('');
    setTimer(TASK_TIME_LIMIT);
  };

  const closeActionModal = () => {
    setActionModal({ open: false, type: '', payload: null });
  };

  const handleTimeout = async (showToast = true) => {
    try {
      const response = await API.game.timeoutInvaders(id);
      updateState(response?.state);
      closeTaskModal();
      if (showToast) {
        ErrorEmmiter(response?.message || 'Время вышло!');
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Не удалось обработать таймаут.';
      ErrorEmmiter(message);
    }
  };

  const openTaskModal = (task, mode) => {
    stopTimer();
    setTaskModal({ open: true, task, mode });
    setAnswer('');
    setTimer(TASK_TIME_LIMIT);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchState = async ({ silent = true } = {}) => {
    try {
      const response = await API.game.getInvadersState(id);
      updateState(response?.state);
    } catch (error) {
      if (!silent) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Не удалось обновить состояние игры.';
        ErrorEmmiter(message);
      }
    }
  };

  useEffect(() => {
    let ignore = false;

    const initialize = async () => {
      setLoading(true);
      try {
        const [gameResponse, joinResponse] = await Promise.all([
          API.game.getByIdUser(id),
          API.game.joinInvaders(id),
        ]);

        if (ignore) {
          return;
        }

        setGameInfo(gameResponse);
        updateState(joinResponse?.state);
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Не удалось загрузить игру.';

        if (!ignore) {
          setBlock(message);
          ErrorEmmiter(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      ignore = true;
      stopTimer();
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (!state?.matchId) {
      return undefined;
    }

    pollRef.current = setInterval(() => {
      fetchState();
    }, 2000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [state?.matchId]);

  const handleReady = async () => {
    try {
      const response = await API.game.readyInvaders(id, { isReady: true });
      updateState(response?.state);
      SuccessEmmiter('Готовность подтверждена');
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Не удалось подтвердить готовность.';
      ErrorEmmiter(message);
    }
  };

  const handleCellClick = async (cell) => {
    if (!currentPlayer || !allReady || taskModal.open || actionModal.open || state?.gameOver) {
      return;
    }

    try {
      const response = await API.game.moveInvaders(id, {
        newX: cell.x,
        newY: cell.y,
      });

      updateState(response?.state);

      if (response?.isOccupied) {
        setActionModal({
          open: true,
          type: 'capture',
          payload: response,
        });
        return;
      }

      if (!cell.ownerId && typeof response?.cost === 'number') {
        setActionModal({
          open: true,
          type: 'spend',
          payload: response,
        });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Ход не выполнен.';
      ErrorEmmiter(message);
    }
  };

  const handleSpendChoice = async (spend) => {
    try {
      const response = await API.game.spendInvaders(id, { spend });
      updateState(response?.state);
      closeActionModal();

      if (response?.task) {
        openTaskModal(response.task, 'spend');
        return;
      }

      if (!spend) {
        SuccessEmmiter('Ход завершён без захвата клетки.');
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Не удалось открыть клетку.';
      ErrorEmmiter(message);
    }
  };

  const handleCaptureChoice = async (useOriginalTask) => {
    try {
      const response = await API.game.captureInvaders(id, { useOriginalTask });
      updateState(response?.state);
      closeActionModal();

      if (response?.task) {
        openTaskModal(response.task, 'capture');
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Не удалось начать захват.';
      ErrorEmmiter(message);
    }
  };

  const handleSubmitAnswer = async () => {
    if (answer === '') {
      ErrorEmmiter('Введите ответ');
      return;
    }

    try {
      const response = await API.game.answerInvaders(id, { answer: Number(answer) });
      updateState(response?.state);
      closeTaskModal();
      SuccessEmmiter(response?.wasCorrect ? 'Верно!' : 'Неверно');
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Не удалось отправить ответ.';
      ErrorEmmiter(message);
    }
  };

  if (block) {
    return <BlockingWindow message={block} />;
  }

  return (
    <main className="invaders-section">
      {loading && <Loading />}
      <div className="container">
        <div className="invaders-layout">
          <section className="invaders-hero">
            <span className="invaders-badge">Математическая игра</span>
            <h1>{gameInfo?.name || 'Захватчики'}</h1>
            <p className="invaders-description">
              Захватывайте клетки, тратьте монеты на попытки и решайте задачи быстрее
              соперников.
            </p>

            <div className="invaders-meta">
              <div className="invaders-meta-item">
                <span>Начало</span>
                <strong>
                  {gameInfo?.startDate
                    ? moment(gameInfo.startDate).format('DD.MM.YYYY HH:mm')
                    : '-'}
                </strong>
              </div>
              <div className="invaders-meta-item">
                <span>Окончание</span>
                <strong>
                  {gameInfo?.endDate
                    ? moment(gameInfo.endDate).format('DD.MM.YYYY HH:mm')
                    : '-'}
                </strong>
              </div>
              <div className="invaders-meta-item">
                <span>Класс</span>
                <strong>{gameInfo?.schoolClass || '-'}</strong>
              </div>
            </div>
          </section>

          <aside className="invaders-sidebar">
            <div className="status-card">
              <h2>Ваш статус</h2>
              <div className="status-line">
                <span>Игрок</span>
                <strong>{currentPlayer?.name || '-'}</strong>
              </div>
              <div className="status-line">
                <span>Монеты</span>
                <strong>{currentPlayer?.coins ?? 0}</strong>
              </div>
              <div className="status-line">
                <span>Клетки</span>
                <strong>{currentPlayer?.capturedCells ?? 0}</strong>
              </div>
              <div className="status-line">
                <span>Координаты</span>
                <strong>{currentPlayer ? `${currentPlayer.x + 1}:${currentPlayer.y + 1}` : '-'}</strong>
              </div>
              <div className="status-line">
                <span>Сейчас ходит</span>
                <strong>{activePlayer?.name || 'Ожидание игроков'}</strong>
              </div>

              {!currentPlayer?.isReady && !state?.gameOver && (
                <button className="primary-btn" onClick={handleReady}>
                  Я готов
                </button>
              )}

              {allReady && !state?.gameOver && (
                <div className={`turn-banner ${isMyTurn ? 'my-turn' : ''}`}>
                  {isMyTurn ? 'Сейчас ваш ход' : 'Сейчас ход другого игрока'}
                </div>
              )}

              {state?.gameOver && <div className="winner-banner">{state?.winner}</div>}
            </div>

            <div className="players-card">
              <h2>Игроки</h2>
              <ul className="players-list">
                {state?.players?.map((player) => (
                  <li key={player.id} className={player.id === state?.playerId ? 'active' : ''}>
                    <div>
                      <strong>{player.name}</strong>
                      <span>{player.isReady ? 'Готов' : 'Ожидает'}</span>
                    </div>
                    <div className="player-stats">
                      <span>{player.coins} мон.</span>
                      <span>{player.capturedCells} клет.</span>
                    </div>
                  </li>
                ))}
              </ul>
              {!allReady && (
                <p className="players-hint">
                  Игра начнётся, когда будут готовы минимум два игрока.
                </p>
              )}
            </div>
          </aside>
        </div>

        <section className="board-card">
          <div className="board-header">
            <h2>Поле 5x5</h2>
            <p>Нажмите на соседнюю клетку, чтобы сделать ход.</p>
          </div>

          <div className="board-grid">
            {state?.grid?.map((row) =>
              row.map((cell) => {
                const ownerIndex = state?.players?.findIndex((player) => player.id === cell.ownerId);
                const isCurrentPlayerCell = currentPlayer?.x === cell.x && currentPlayer?.y === cell.y;
                const ownerName = state?.players?.find((player) => player.id === cell.ownerId)?.name;

                return (
                  <button
                    key={`${cell.x}-${cell.y}`}
                    className={`board-cell owner-${ownerIndex + 1} ${isCurrentPlayerCell ? 'current' : ''}`}
                    onClick={() => handleCellClick(cell)}
                    type="button"
                  >
                    <span className="cell-position">{cell.x + 1}:{cell.y + 1}</span>
                    <strong>{cell.ownerId ? 'Захвачена' : `${cell.cost} мон.`}</strong>
                    <span>
                      {cell.ownerId ? ownerName || 'Игрок' : `Сложность ${cell.difficulty}`}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>

      {actionModal.open && (
        <div className="invaders-modal-overlay">
          <div className="invaders-modal">
            {actionModal.type === 'spend' ? (
              <>
                <h3>Открыть клетку?</h3>
                <p>На решение задачи уйдёт {actionModal.payload?.cost} монет.</p>
                <div className="modal-actions">
                  <button className="primary-btn" onClick={() => handleSpendChoice(true)}>
                    Решать
                  </button>
                  <button className="secondary-btn" onClick={() => handleSpendChoice(false)}>
                    Пропустить
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Захват клетки</h3>
                <p>Выберите способ атаки.</p>
                <div className="modal-actions column">
                  <button className="primary-btn" onClick={() => handleCaptureChoice(true)}>
                    Удвоенная стоимость: {actionModal.payload?.doubleCost}
                  </button>
                  <button className="secondary-btn" onClick={() => handleCaptureChoice(false)}>
                    Более сложная задача: {actionModal.payload?.originalCost}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {taskModal.open && (
        <div className="invaders-modal-overlay">
          <div className="invaders-modal">
            <h3>Решите задачу</h3>
            <p className="task-text">{taskModal.task}</p>
            <div className="timer-badge">Осталось: {timer} сек</div>
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Введите ответ"
            />
            <div className="modal-actions">
              <button className="primary-btn" onClick={handleSubmitAnswer}>
                Ответить
              </button>
              <button className="secondary-btn" onClick={() => handleTimeout(false)}>
                Сдаться
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default InvadersGame;
