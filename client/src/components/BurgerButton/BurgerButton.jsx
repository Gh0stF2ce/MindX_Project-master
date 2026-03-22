import classes from './burgerbutton.module.css'
import burger from './burger-menu-svgrepo-com.svg'
import { useState } from 'react';

const BurgerButton = (props) => {
    const { setIsActiveBurger } = props
    return (
        <button onClick={() => setIsActiveBurger(true)} className={classes.button}><img alt='burger' src={burger} /></button>
    );
}

export default BurgerButton;