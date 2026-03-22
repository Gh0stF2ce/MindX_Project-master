import accountIcon from './account.svg'
import classes from './accountbtn.module.css'

const AccountBtn = () => {
    return (
        <button className={classes.account_button}>
            <img src={accountIcon} alt="account" />
        </button>
    );
}

export default AccountBtn;