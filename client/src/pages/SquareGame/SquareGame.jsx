import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GameInformationPanel from '@mindx/components/GameInformationPanel/GameInformationPanel';
import QuestionButton from './components/QuestionButton/QuestionButton';
import ModalWindowSquare from './components/ModalWindowSquare/ModalWindowSquare';
import classes from './squaregame.module.css';
import useDidMountEffect from '@mindx/customHooks/useDidMountEffect';
import BonusSquare from './components/BonusSquare/BonusSquare';
import BlockingWindow from '@mindx/components/BlockingWindow/BlockingWindow';
import { API } from '@mindx/http/API';
import { ErrorEmmiter } from '@mindx/components/UI/Toastify/Notify';
import Loading from '@mindx/components/UI/Loading/Loading';

const SquareGame = () => {
	const { id } = useParams();
	const [block, setBlock] = useState(null);
	const [currentQuestion, setCurrentQuestion] = useState(null);
	const [currentTheme, setCurrentTheme] = useState(null);
	const [bonusRow, setBonusRow] = useState([]);
	const [bonusCol, setBonusCol] = useState([]);
	const [score, setScore] = useState(0);
	const [questions, setQuestions] = useState([]);
	const [themes, setThemes] = useState([]);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const levels = [1, 2, 3, 4, 5];
  const [loading, setLoading] = useState(true);
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		setLoading(true);
		setInitialized(false);
		API.game
			.getByIdUser(id)
			.then((response) => {
				setThemes(response.themeGames);
				setQuestions(response.questionGames);
				setStartDate(response.startDate);
				setEndDate(response.endDate);
				const initialRow = Array(5).fill(null);
				const initialCol = Array(5).fill(null);
				response?.bonuses.forEach(bonus => {
					if (bonus.type === 'row') {
						initialRow[bonus.lvl - 1] = bonus;
					} else {
						initialCol[bonus.lvl - 1] = bonus;
					}
				});
				setBonusCol(initialCol);
				setBonusRow(initialRow);
				let currentPoints = response.questionGames.flat().reduce((accumulator, currentValue) => {
					if (currentValue?.userAnswer?.points) {
						const curPoints = currentValue.userAnswer.points;
						accumulator += currentValue.userAnswer.isCorrect ? curPoints : 0;
					}
          return accumulator;
				}, 0)
				currentPoints += response?.bonuses.reduce((accumulator, currentValue) => {
					if (currentValue.points) {
						accumulator += currentValue.points;
					}
					return accumulator;
				}, 0);
				setScore(currentPoints);
				setLoading(false);
				setInitialized(true);
			})
			.catch((error) => {
				const message = error?.response.data?.error;
				setBlock(message);
				console.error(error);
				ErrorEmmiter(message);
			});
	}, [id]);

	useEffect(() => {
		if (initialized && questions.length) {
			for (let i = 0; i < 5; i++) {
				checkColumn(i);
				checkRow(i);
			}
		}
	}, [questions, initialized])

	const checkColumn = (index) => {
		for (let i = 0; i < 5; i++) {
			if (questions[i][index]?.userAnswer?.isCorrect === false) {
				setBonusCol(prev => {
					const newCol = [...prev];
					newCol[index] = false;
					return newCol;
				});
				return;
			}
		}
	}

	const checkRow = (index) => {
		if (questions[index].some(item => item?.userAnswer?.isCorrect === false)) {
			setBonusRow(prev => {
				const newRow = [...prev];
				newRow[index] = false;
				return newRow;
			});
			return;
		}
	}

	return (
		<>
			<main className={classes.section}>
				{
					block 
						? <BlockingWindow message={block}/>
						: 
					<>
						{				
							loading && <Loading/>
						}
						<div className='container'>
							<div className={classes.wrapper}>
								<GameInformationPanel score={score} endDate={endDate}/>
								{currentQuestion && (
									<ModalWindowSquare
										key={currentQuestion.question.id}
										gameId={id}
										currentTheme={currentTheme}
										currentQuestion={currentQuestion}
										setCurrentQuestion={setCurrentQuestion}
										setScore={setScore}
										questions={questions}
										setQuestions={setQuestions}
										setBonusRow={setBonusRow}
										setBonusCol={setBonusCol}
										endDate={endDate}
									/>
								)}
								<table className={classes.table_square}>
									<thead>
										<tr className={classes.tr_square}>
											<th className={classes.th_square}>Тема</th>
											{levels.map((level) => (
												<td
													className={classes.td_square}
													key={level}
												>
													Уровень {level}
												</td>
											))}
											<th className={classes.th_square}>Бонус</th>
										</tr>
									</thead>
									<tbody>
										{themes.map(({ id, numberTheme, theme }) => (
											<tr
												key={id}
												className={classes.tr_square}
											>
												<td className={`${classes.theme} ${classes.td_square}`}>
													<span className={classes.theme_text}>{theme.name}</span>
												</td>
												{questions[numberTheme - 1].map((item) => (
													<QuestionButton
														key={item.id}
														model={item}
														setCurrentQuestion={setCurrentQuestion}
														level={
															item.numberQuestion % 5 === 0
																? 5
																: item.numberQuestion % 5
														}
														setCurrentTheme={setCurrentTheme}
														numberTheme={numberTheme}
													/>
												))}
												<BonusSquare
													key={numberTheme + 1}
													value={50}
													bonus={bonusRow[numberTheme - 1]}
												/>
											</tr>
										))}
										<tr className={classes.tr_square}>
											<th className={classes.th_square}>Бонус</th>
											{levels.map((level) => (
												<BonusSquare
													key={level}
													value={level * 10}
													bonus={bonusCol[level - 1]}
												/>
											))}
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</>
				}
			</main>
		</>
	);
};

export default SquareGame;
