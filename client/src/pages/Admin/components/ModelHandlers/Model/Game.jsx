import './model.scss';
import React, { useState, useEffect, useMemo } from 'react';
import CatalogRef from '@mindx/components/UI/CatalogRef/CatalogRef';
import MXSelect from '@mindx/components/UI/MXSelect/MXSelect';
import MXDatetime from '@mindx/components/UI/MXDatetime/MXDatetime';
import moment from 'moment';

const TYPE_LIST = [
  {
    value: 'square',
    label: 'Квадрат',
  },
  {
    value: 'carousel',
    label: 'Карусель',
  },
  {
    value: 'invaders',
    label: 'Захватчики',
  },
];

const SCHOOL_CLASS_OPTIONS = [
  { value: '6', label: '6 класс' },
  { value: '7', label: '7 класс' },
  { value: '8', label: '8 класс' },
];

const PAGE_COUNT = {
  square: 6,
  carousel: 2,
  invaders: 1,
};

const Game = (props) => {
  const { model } = props;

  const [typeGame, setTypeGame] = useState(
    model?.typeGame ? model.typeGame : ''
  );
  const [name, setName] = useState(model?.name ? model.name : '');
  const [startDate, setStartDate] = useState(
    model?.startDate ? moment(model.startDate) : null
  );
  const [endDate, setEndDate] = useState(
    model?.endDate ? moment(model.endDate) : null
  );
  const [imageId, setImageId] = useState(model?.imageId ? model.imageId : null);
  const [accessGames, setAccessGames] = useState(
    model?.accessGames ? model.accessGames : []
  );
  const [schoolClass, setSchoolClass] = useState(
    model?.schoolClass ? String(model.schoolClass) : ''
  );
  const [page, setPage] = useState(1);
  const [themeGames, setThemes] = useState(
    model?.themeGames ? model.themeGames : []
  );
  const [questionGames, setQuestions] = useState(
    model?.questionGames ? model.questionGames : []
  );
  const [scoreFirst, setScoreFirst] = useState(
    model?.scoreFirst ? model?.scoreFirst : null
  );
  const [scoreSuccess, setScoreSuccess] = useState(
    model?.scoreSuccess ? model?.scoreSuccess : null
  );
  const [scoreFailure, setScoreFailure] = useState(
    model?.scoreFailure ? model?.scoreFailure : null
  );
  const [countQuestionsOfCarousel, setCountQuestionsOfCarousel] =
    useState(model?.countQuestionsOfCarousel || null);

  const totalPages = useMemo(() => {
    if (PAGE_COUNT[typeGame]) {
      let total = JSON.parse(JSON.stringify(PAGE_COUNT[typeGame]));
      if (typeGame === 'carousel' && countQuestionsOfCarousel) {
        total += Math.ceil(countQuestionsOfCarousel / 5);
      }
      return total;
    }
    return 1;
  }, [typeGame, countQuestionsOfCarousel]);

  const handleThemeChange = (themeIndex, selectedTheme) => {
    setThemes((prevThemes) => {
      const newThemes = [...prevThemes];
      newThemes[themeIndex] = selectedTheme;
      return newThemes;
    });
  };

  const handleSquareQuestionChange = (themeIndex, questionIndex, selectedQuestion) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      if (!newQuestions[themeIndex]) {
        newQuestions[themeIndex] = [];
      }
      newQuestions[themeIndex][questionIndex] = selectedQuestion;
      return newQuestions;
    });
  };

  const handleCarouselQuestionChange = (
    questionIndex,
    selectedQuestion
  ) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions[questionIndex] = selectedQuestion;
      return newQuestions;
    });
  };

  const handleAccessGameChange = (selectedRole) => {
    if (!selectedRole) {
      setAccessGames([]);
      return;
    }

    setAccessGames([selectedRole]);
  };

  useEffect(() => {
    if (typeGame === 'carousel' && countQuestionsOfCarousel !== null && questionGames.length > countQuestionsOfCarousel) {
      setQuestions(prevQuestions => prevQuestions.slice(0, countQuestionsOfCarousel));
    }
  }, [countQuestionsOfCarousel, typeGame, questionGames.length]);

  useEffect(() => {
    setPage(1);
  }, [typeGame]);

  useEffect(() => {
    if (model?.typeGame && model.typeGame !== typeGame) {
      clearQuestions();
      clearThemes();
      if (typeGame !== 'carousel') {
        clearCarouselDataValues();
      }
      if (typeGame !== 'invaders') {
        setSchoolClass('');
      }
    }
    model.typeGame = typeGame;
  }, [model, typeGame]);

  useEffect(() => {
    model.name = (name).trim();
  }, [model, name]);

  useEffect(() => {
    model.startDate = startDate;
  }, [model, startDate]);

  useEffect(() => {
    model.endDate = endDate;
  }, [model, endDate]);

  useEffect(() => {
    model.imageId = imageId;
  }, [model, imageId]);

  useEffect(() => {
    model.accessGames = accessGames;
  }, [model, accessGames]);

  useEffect(() => {
    if (schoolClass) {
      model.schoolClass = schoolClass;
    } else {
      delete model.schoolClass;
    }
  }, [model, schoolClass]);

  useEffect(() => {
    model.themeGames = themeGames;
  }, [model, themeGames]);

  useEffect(() => {
    model.questionGames = questionGames;
  }, [model, questionGames]);

  useEffect(() => {
    if (scoreFirst) {
      model.scoreFirst = scoreFirst;
    } else {
      delete model.scoreFirst;
    }
  }, [model, scoreFirst]);

  useEffect(() => {
    if (scoreSuccess) {
      model.scoreSuccess = scoreSuccess;
    } else {
      delete model.scoreSuccess;
    }
  }, [model, scoreSuccess]);

  useEffect(() => {
    if (scoreFailure) {
      model.scoreFailure = scoreFailure;
    } else {
      delete model.scoreFailure;
    }
  }, [model, scoreFailure]);

  useEffect(() => {
    if (countQuestionsOfCarousel) {
      model.countQuestionsOfCarousel = countQuestionsOfCarousel;
    } else {
      delete model.countQuestionsOfCarousel;
    }
  }, [model, countQuestionsOfCarousel]);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const getCarouselQuestionsRange = () => {
    if (page <= 2) return [];
    const questionsPerPage = 5;
    const startIndex = (page - 3) * questionsPerPage;
    const endIndex = Math.min(startIndex + questionsPerPage, countQuestionsOfCarousel);
    return Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
  };

  const clearCarouselDataValues = () => {
    setScoreFailure(null);
    setScoreFirst(null);
    setScoreSuccess(null);
    setCountQuestionsOfCarousel(null);
  };

  const clearQuestions = () => {
    setQuestions([]);
  };

  const clearThemes = () => {
    setThemes([]);
  };

  return (
    <div className='model-section'>
      <form onSubmit={(e) => e.preventDefault()}>
        {page === 1 && (
          <>
            <div className='group-label'>
              <label>Тип</label>
              <MXSelect
                options={TYPE_LIST}
                onChange={setTypeGame}
                defaultValue={model?.typeGame ? model.typeGame : null}
                placeholder='Выберите тип...'
              />
            </div>
            <div className='group-label'>
              <label>Название</label>
              <input
                type='text'
                placeholder='Название...'
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className='group-label'>
              <label>Дата начала</label>
              <MXDatetime
                initialValue={moment(
                  model?.startDate ? moment(model.startDate) : null
                )}
                onChange={setStartDate}
              />
            </div>
            <div className='group-label'>
              <label>Дата окончания</label>
              <MXDatetime
                initialValue={moment(
                  model?.endDate ? moment(model.endDate) : null
                )}
                onChange={setEndDate}
              />
            </div>
            <div className='group-label'>
              <label>Изображение</label>
              <CatalogRef
                defaultValue={model?.imageId ? model.imageId : null}
                onChange={setImageId}
                url={'image'}
                img={true}
                placeholder='Выберите изображение...'
              />
            </div>
            <div className='group-label'>
              <label>Доступно для ролей</label>
              <CatalogRef
                defaultValue={model?.accessGames?.[0] ? model.accessGames[0] : null}
                onChange={handleAccessGameChange}
                url={'role'}
                path={'name'}
                placeholder='Выберите роль...'
              />
            </div>
            {typeGame === 'invaders' && (
              <div className='group-label'>
                <label>Класс</label>
                <MXSelect
                  options={SCHOOL_CLASS_OPTIONS}
                  onChange={setSchoolClass}
                  defaultValue={schoolClass || null}
                  placeholder='Выберите класс...'
                />
              </div>
            )}
          </>
        )}
        {typeGame === 'square' && (
          <>
            {[1, 2, 3, 4, 5].map((item, themeIndex) => (
              <React.Fragment key={`theme-fragment-${item}`}>
                {page === item + 1 && (
                  <div
                    className='group-label'
                    key={`theme-group-${item}`}
                  >
                    <label>{`Тема №${item}`}</label>
                    <CatalogRef
                      defaultValue={themeGames[themeIndex] || null}
                      onChange={(selectedTheme) =>
                        handleThemeChange(themeIndex, selectedTheme)
                      }
                      url={'theme'}
                      path={'name'}
                      placeholder={`Выберите тему №${item}...`}
                    />
                  </div>
                )}
                {page === item + 1 &&
                  [1, 2, 3, 4, 5].map((question, questionIndex) => (
                    <div
                      className='group-label'
                      key={`question-group-${item}-${question}`}
                    >
                      <label>{`Вопрос LVL ${question}`}</label>
                      <CatalogRef
                        defaultValue={
                          questionGames[themeIndex]?.[questionIndex] || null
                        }
                        onChange={(selectedQuestion) =>
                          handleSquareQuestionChange(
                            themeIndex,
                            questionIndex,
                            selectedQuestion
                          )
                        }
                        url={'question'}
                        path={'question'}
                        placeholder={`Выберите вопрос LVL ${question}`}
                      />
                    </div>
                  ))}
              </React.Fragment>
            ))}
          </>
        )}
        {typeGame === 'carousel' && (
          <>
            {page === 2 && (
              <React.Fragment key='carousel-scores'>
                <div
                  className='group-label'
                  key='score-first'
                >
                  <label>Начальное значение очков</label>
                  <input
                    type='number'
                    placeholder='Кол-во...'
                    value={scoreFirst || ''}
                    onChange={(e) => setScoreFirst(e.target.value)}
                  />
                </div>
                <div
                  className='group-label'
                  key='score-success'
                >
                  <label>Бонус за правильный ответ</label>
                  <input
                    type='number'
                    placeholder='Кол-во...'
                    value={scoreSuccess || ''}
                    onChange={(e) => setScoreSuccess(e.target.value)}
                  />
                </div>
                <div
                  className='group-label'
                  key='score-failure'
                >
                  <label>Штраф за неверный ответ</label>
                  <input
                    type='number'
                    placeholder='Кол-во...'
                    value={scoreFailure || ''}
                    onChange={(e) => setScoreFailure(e.target.value)}
                  />
                </div>
                <div
                  className='group-label'
                  key='questions-count'
                >
                  <label>Количество вопросов</label>
                  <input
                    type='number'
                    placeholder='Кол-во...'
                    value={countQuestionsOfCarousel || ''}
                    onChange={(e) =>
                      setCountQuestionsOfCarousel(Number(e.target.value))
                    }
                  />
                </div>
              </React.Fragment>
            )}
            {page > 2 && countQuestionsOfCarousel > 0 && (
              <>
                {getCarouselQuestionsRange().map((questionIndex) => (
                  <div
                    className='group-label'
                    key={`carousel-question-${questionIndex}`}
                  >
                    <label>{`Вопрос №${questionIndex + 1}`}</label>
                    <CatalogRef
                      defaultValue={questionGames[questionIndex] || null}
                      onChange={(selectedQuestion) =>
                        handleCarouselQuestionChange(questionIndex, selectedQuestion)
                      }
                      url={'question'}
                      path={'question'}
                      placeholder={`Выберите вопрос №${questionIndex + 1}`}
                    />
                  </div>
                ))}
              </>
            )}
          </>
        )}
        <div className='button-group'>
          <button
            className={page === 1 ? 'visible_false' : ''}
            type='button'
            onClick={() => prevPage()}
          >
            Назад
          </button>
          <label>
            {page}/{totalPages}
          </label>
          <button
            className={page === totalPages ? 'visible_false' : ''}
            type='button'
            onClick={() => nextPage()}
          >
            Далее
          </button>
        </div>
      </form>
    </div>
  );
};

export default Game;
