import classes from './bonusSquare.module.css'
import { HiCheck, HiX } from 'react-icons/hi';

const BonusSquare = (props) => {
    const { value, bonus } = props
    return (
        (bonus === null ?
            <td className={classes.bonus}>+{value}</td> :
            bonus ?
                <td className={`${classes.bonus} ${classes.true}`}>+{value} <HiCheck className={classes.icon}/> </td> :
                <td className={`${classes.bonus} ${classes.false}`}><HiX className={classes.icon}/></td>
        )
    );
}

export default BonusSquare;