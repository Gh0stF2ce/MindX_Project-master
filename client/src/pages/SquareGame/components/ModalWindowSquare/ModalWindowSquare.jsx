import classes from './modalWindowSquare.module.css';
import { useState } from 'react';
import { API } from '@mindx/http/API';
import { ErrorEmmiter } from '@mindx/components/UI/Toastify/Notify';
import { Image } from 'react-bootstrap';
import { mindxDebounce } from '@mindx/utils/tools'
import moment from 'moment';
import { getApiHost } from '@mindx/utils/apiHost';

const apiHost = getApiHost();

const ModalWindowSquare = (props) => {
	const {
		setCurrentQuestion,
		currentQuestion,
		currentTheme,
		setScore,
		gameId,
		questions,
		setQuestions,
		setBonusRow,
		setBonusCol,
		endDate
	} = props;

	const scoreQuestion = (((currentQuestion.numberQuestion - 1) % 5) + 1) * 10;
	const [answer, setAnswer] = useState('');
	const level =
		currentQuestion.numberQuestion % 5 === 0
			? 5
			: currentQuestion.numberQuestion % 5;

	const postAnswer = (body) => {
		API.game
			.postAnswer({ gameId, body })
			.then(({ isCorrect, bonuses }) => {
				questions[currentTheme - 1][level - 1].userAnswer = {
					isCorrect,
					userAnswer: body.userAnswer,
				};
				bonuses.forEach(bonus => {
					if (bonus.type === 'row') {
						setBonusRow(prev => {
							const newRow = [...prev];
							newRow[bonus.lvl - 1] = bonus;
							return newRow;
						});
					} else {
						setBonusCol(prev => {
							const newCol = [...prev];
							newCol[bonus.lvl - 1] = bonus;
							return newCol;
						});
					}
					ChangeScore(bonus.points);
				});
				setQuestions([...questions]);
				if (isCorrect) {
					ChangeScore(scoreQuestion);
				}
			})
			.catch((error) => {
				console.error(error);
				ErrorEmmiter(error?.response?.data?.error || 'Не удалось отправить ответ.');
			});
	};

	const handleAnswer = mindxDebounce(() => {
		if (!currentQuestion.userAnswer && answer) {
			const body = {
				questionGameId: currentQuestion.id,
				userAnswer: (answer).trim(),
				points: level * 10,
			};
			postAnswer(body);
			setCurrentQuestion(null);
		} else {
			ErrorEmmiter('Поле ответа не может быть пустым!');
		}
	});

	const ChangeScore = (points) => {
		setScore(prev => prev + points);
	};

	return (
		<div className={classes.modal_dark}>
			<div className={classes.modal_window_square}>
				<button
					className={classes.close_button}
					onClick={() => setCurrentQuestion(null)}
				>
					&times;
				</button>
				<div className={classes.content_question}>
					{currentQuestion.question.imageId && (
						<Image
							src={`${apiHost}/api/${currentQuestion.question.imageId}.jpg`}
						/>
					)}
					{currentQuestion.question.question}
				</div>
				<div className={classes.content_answer}>
					{!currentQuestion.userAnswer ? (
						<textarea
							placeholder='Введите ответ:'
							className={classes.text_answer}
							onChange={(e) => setAnswer(e.target.value)}
						/>
					) : (
						<textarea
							readOnly
							className={classes.text_answer}
							defaultValue={currentQuestion.userAnswer.userAnswer || '(Вы ничего не ответили.)'}
						/>
					)}
					<div className={classes.content_buttons}>
						{ moment() < moment(endDate) && !currentQuestion.userAnswer ? (
							<>
								<button
									className={`${classes.button} ${classes.green}`}
									onClick={() => handleAnswer()}
								>
									Ответить
								</button>
							</>
						) : (
							<button
								className={`${classes.button} ${classes.red}`}
								onClick={() => setCurrentQuestion(null)}
							>
								Закрыть
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ModalWindowSquare;
