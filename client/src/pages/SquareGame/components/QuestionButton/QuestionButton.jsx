import classes from './questionButton.module.css';
import { HiCheck, HiX, HiQuestionMarkCircle } from 'react-icons/hi';

const QuestionButton = (props) => {
    const { model, setCurrentQuestion, level, numberTheme, setCurrentTheme } = props;
    
    const handleClick = () => {
        setCurrentQuestion(model);
        setCurrentTheme(numberTheme);
    };

    const value = level ? level * 10 : <HiQuestionMarkCircle size={16} />;

    return (
        <td className={classes.question_button_wrapper}>
            {!model.userAnswer ? (
                <a href='#' className={classes.question_button} onClick={handleClick}>
                    {value}
                </a>
            ) : model.userAnswer.isCorrect ? (
                <a href='#' className={`${classes.question_button} ${classes.green}`} onClick={handleClick}>
                    {value} <HiCheck className={classes.icon} />
                </a>
            ) : (
                <a href='#' className={`${classes.question_button} ${classes.red}`} onClick={handleClick}>
                    {value} <HiX className={classes.icon} />
                </a>
            )}
        </td>
    );
};

export default QuestionButton;