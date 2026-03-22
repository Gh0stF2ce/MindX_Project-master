import classes from './gameCard.module.css';
import { NavLink } from 'react-router-dom';
import { Image } from 'react-bootstrap';

const GameCard = (props) => {
    const { model } = props;

    const now = new Date();
    const startDate = new Date(model.startDate);
    const endDate = new Date(model.endDate);

    let gameStatus;
    if (now < startDate) {
        gameStatus = { status: 'Ожидание', color: '#FFA500' };
    } else if (now >= startDate && now <= endDate) {
        gameStatus = { status: 'Запущена', color: '#4CAF50' };
    } else {
        gameStatus = { status: 'Завершено', color: '#FF5252' };
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <li className={classes.game_item}>
            <div className={classes.wrapper}>
                <div className={classes.status}>
                    <div
                        className={classes.circle}
                        style={{ backgroundColor: gameStatus.color }}
                        title={gameStatus.status}
                    ></div>
                    <div className={classes.game_status_text}>{gameStatus.status}</div>
                </div>
                <Image
                    width={300}
                    height={300}
                    className={classes.game_img}
                    src={`${process.env.REACT_APP_HOST}/api/${model.imageId || 'without_image'}.jpg`}
                />
                <div className={classes.game_name}>{model.name}</div>
                <div className={classes.game_info}>
                    <div className={classes.game_time}>
                        <span>Начало: {formatDate(model.startDate)}</span>
                        <span>Окончание: {formatDate(model.endDate)}</span>
                    </div>
                </div>
                <NavLink to={`/${model.typeGame}/${model.id}`} className={classes.start_game_button}>
                    Начать игру
                </NavLink>
            </div>
        </li>
    );
};

export default GameCard;