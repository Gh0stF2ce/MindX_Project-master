import './carouselgame.scss';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import BlockingWindow from '@mindx/components/BlockingWindow/BlockingWindow';
import GameInformationPanel from '@mindx/components/GameInformationPanel/GameInformationPanel';
import { API } from '@mindx/http/API';
import { ErrorEmmiter } from '@mindx/components/UI/Toastify/Notify';
import { mindxDebounce } from '@mindx/utils/tools';
import Loading from '@mindx/components/UI/Loading/Loading';
import moment from 'moment';
import { Image } from 'react-bootstrap';

const CarouselGame = () => {
  const { id } = useParams();
	const [block, setBlock] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [endDate, setEndDate] = useState(null);
  const [carouselData, setCarouselData] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [lastQuestion, setLastQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [endGame, setEndGame] = useState(false);

  const questionsListRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    API.game
      .getByIdUser(id)
      .then((response) => {
        setQuestions(response.questionGames);
        setEndDate(response.endDate);
        setCarouselData(response.carouselData);
        const currentPoints = response.questionGames.reduce((accumulator, currentValue) => {
					if (currentValue?.userAnswer?.isCorrect) {
						accumulator += currentValue.userAnswer.points;
					}
          return accumulator;
				}, 0);
				setScore(currentPoints);
        setLoading(false);
      })
      .catch((error) => {
        const message = error?.response.data?.error;
				setBlock(message);
				console.error(error);
				ErrorEmmiter(message);
      });
  }, [id]);

  useEffect(() => {
      const lastIndex = questions.findIndex((item) => item.userAnswer === null);
      setCurrentQuestionIndex(lastIndex !== -1 ? lastIndex : questions.length - 1);
      setLastQuestion(questions[lastIndex !== -1 ? lastIndex : questions.length - 1]);
      if (lastIndex !== -1) {
        setUserAnswer('');
      }
  }, [questions]);

  useEffect(() => {
    if (questions[questions.length - 1]?.userAnswer?.points) {
      setEndGame(true);
    }
  }, [questions]);

  useEffect(() => {
    if (Number.isFinite(currentQuestionIndex) && currentQuestionIndex >= 0) {
      setCurrentQuestion(questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (questionsListRef.current && currentQuestionIndex !== null) {
      const questionElement = questionsListRef.current.children[currentQuestionIndex];
      if (questionElement) {
        questionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentQuestionIndex]);

  const possibleScore = useMemo(() => {
    let possibleScore = null;
    if (currentQuestion?.id) {
      const prevAnswer = questions[currentQuestionIndex - 1]?.userAnswer;
      if (currentQuestion.numberQuestion === 1 ) {
        possibleScore = carouselData.scoreFirst;
      } else if (prevAnswer.isCorrect) {
        possibleScore = prevAnswer?.points + carouselData.scoreSuccess;
      } else {
        possibleScore = prevAnswer?.points - carouselData.scoreFailure < carouselData.scoreFirst
          ? carouselData.scoreFirst
          : prevAnswer?.points - carouselData.scoreFailure
      }
    }
    return possibleScore;
  }, [currentQuestion]);

  const handleSphereClick = (index) => {
    setCurrentQuestionIndex(index);
    setUserAnswer('');
  };

  const returnToLastQuestion = () => {
    setCurrentQuestionIndex(lastQuestion.numberQuestion - 1);
  };

  const scrollQuestions = (direction) => {
    if (questionsListRef.current) {
      const scrollAmount = 100;
      if (direction === 'left') {
        questionsListRef.current.scrollLeft -= scrollAmount;
      } else {
        questionsListRef.current.scrollLeft += scrollAmount;
      }
    }
  };

  const postAnswer = mindxDebounce(() => {
    if (userAnswer) {
      const body = {
        questionGameId: lastQuestion.id,
        userAnswer: (userAnswer).trim(),
        points: possibleScore,
      };
      const gameId = id;
      API.game
        .postAnswer({ gameId, body })
        .then(({ isCorrect }) => {
          const currentIndex = currentQuestionIndex;
          questions[currentIndex].userAnswer = {
            isCorrect,
            userAnswer: body.userAnswer,
            points: possibleScore,
          };
          setQuestions([...questions]);
          if (questions[currentIndex].userAnswer.isCorrect) {
            setScore(score + possibleScore);
          }
        })
        .catch((error) => {
          console.error(error?.response?.data?.error);
        });
    } else {
      ErrorEmmiter('Поле ответа не может быть пустым!');
    }
  });

  return (
    <>
      <main className="carousel-section">
        {
          block 
						? <BlockingWindow message={block}/>
						: 
          <>
            {
              loading && <Loading/>
            }
            <div className="carousel-wrapper">
            <GameInformationPanel score={score} endDate={endDate}/>
              <div className="carousel">
                <div className="questions__container">
                  <button className="scroll-button left" onClick={() => scrollQuestions('left')}>
                    &lt;
                  </button>
                  <div className="questions__list" ref={questionsListRef}>
                    {questions.map((item, index) => (
                      <div key={index} className="sphere-container">
                        <button
                          disabled={index > lastQuestion?.numberQuestion - 1}
                          className={`sphere 
                            ${index === currentQuestionIndex ? 'active' : ''}
                            ${item?.userAnswer?.isCorrect === true && 'correct'}
                            ${item?.userAnswer?.isCorrect === false && 'incorrect'}`}
                          onClick={() => handleSphereClick(index)}
                        >
                          {index + 1}
                        </button>
                        {item?.userAnswer && (
                          <div className="points">
                            {item?.userAnswer?.isCorrect ? `+${item.userAnswer.points}` : '+0'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="scroll-button right" onClick={() => scrollQuestions('right')}>
                    &gt;
                  </button>
                </div>
                <div className="carousel__item">
                  <div className="carousel_item-head">№{currentQuestionIndex + 1}</div>
                  <div className="carousel_item-body">
                    {questions[currentQuestionIndex]?.question?.imageId && (
                      <div className="image-container">
                        <Image
                          src={`${process.env.REACT_APP_HOST}/api/${questions[currentQuestionIndex]?.question?.imageId}.jpg`}
                          className="question-image"
                        />
                      </div>
                    )}
                    <div className="question-text">
                      {questions[currentQuestionIndex]?.question?.question}
                    </div>
                  </div>
                  <div className="answer-section">
                  <input
                    type="text"
                    readOnly={currentQuestion?.id !== lastQuestion?.id || endGame}
                    value={currentQuestion?.userAnswer?.userAnswer || userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Введите ваш ответ"
                    className="answer-input"
                  />

                  {
                    moment() < moment(endDate) && !endGame
                    ?
                      <>
                        {
                          currentQuestion?.id !== lastQuestion?.id
                          ?
                            <button className="button red-button" onClick={() => returnToLastQuestion()}>
                              Вернуться к текущему вопросу
                            </button>
                          :
                            <button className="button submit-button" onClick={() => postAnswer()}>
                              Ответить [+{possibleScore}]
                            </button>
                        }
                      </>
                    :
                      <button className="button red-button" disabled={true}>
                        Игра окончена!
                      </button>
                  }
                </div>
                </div>

              </div>
            </div>
          </>
        }
      </main>
    </>
  );
};

export default CarouselGame;