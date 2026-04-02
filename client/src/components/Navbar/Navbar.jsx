import './navbar.scss';
import { NavLink } from 'react-router-dom';
import Logo from './../../components/UI/Logo/Logo';
import { useState, useEffect, useContext } from 'react';
import BurgerButton from './../BurgerButton/BurgerButton';
import { Context } from '../../index';
import { observer } from 'mobx-react-lite';
import { API } from '@mindx/http/API';
import { ErrorEmmiter, SuccessEmmiter } from '@mindx/components/UI/Toastify/Notify';
import UserSettingsModal from '@mindx/components/UserSettingsModal/UserSettingsModal';

const Navbar = observer((props) => {
    const { user } = useContext(Context);
    const strongLink = ' link-strong';
    const activeLink = 'nav-list_link nav-list_link-active';
    const passiveLink = 'nav-list_link';
    const [isMobile, setIsMobile] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { setIsActiveBurger } = props;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 800);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const logout = async () => {
        try {
            const response = await API.user.logout();
            SuccessEmmiter(response.message);
        } catch (error) {
            ErrorEmmiter(error?.response?.data?.error || 'Не удалось выйти из аккаунта.');
        } finally {
            user.logout();
            window.location.reload();
        }
    };

    const logoutAll = async () => {
        try {
            const response = await API.user.logoutAll();
            SuccessEmmiter(response.message);
            await logout();
        } catch (error) {
            ErrorEmmiter(error?.response?.data?.error || 'Не удалось завершить все сессии.');
        }
    };

    return (
        <nav className="nav">
            <UserSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <div className="container">
                <div className="nav-row">
                    {!isMobile ? (
                        <>
                            <NavLink to="/" className="logo_left">
                                <Logo Width="70px" Height="42px" />
                            </NavLink>
                            <ul className="nav-list">
                                {user.isAuth && (
                                    <>
                                        <li className="nav-list_item">
                                            <NavLink to="/square" className={({ isActive }) => `${isActive ? activeLink : passiveLink} ${strongLink}`}>
                                                Квадрат
                                            </NavLink>
                                        </li>
                                        <li className="nav-list_item">
                                            <NavLink to="/carousel" className={({ isActive }) => `${isActive ? activeLink : passiveLink} ${strongLink}`}>
                                                Карусель
                                            </NavLink>
                                        </li>
                                        <li className="nav-list_item">
                                            <NavLink to="/invaders" className={({ isActive }) => `${isActive ? activeLink : passiveLink} ${strongLink}`}>
                                                Захватчики
                                            </NavLink>
                                        </li>
                                        <li className="nav-list_item">
                                            <NavLink to="/rating" className={({ isActive }) => isActive ? activeLink : passiveLink}>
                                                Рейтинг
                                            </NavLink>
                                        </li>
                                    </>
                                )}
                                {user.isAdmin && (
                                    <li className="nav-list_item">
                                        <NavLink to="/admin" className={({ isActive }) => isActive ? activeLink : passiveLink}>
                                            Админ-панель
                                        </NavLink>
                                    </li>
                                )}
                                {!user.isAuth ? (
                                    <li className="nav-list_item">
                                        <NavLink to="/signin" className="button authorize">
                                            Войти / Зарегистрироваться
                                        </NavLink>
                                    </li>
                                ) : (
                                    <li className="nav-list_item auth">
                                        <div className="auth-actions">
                                            <NavLink className="button authorize">
                                                {user.user.username}
                                            </NavLink>
                                            <button className="button secondary-action" onClick={() => setIsSettingsOpen(true)}>
                                                Настройки
                                            </button>
                                            <button className="button secondary-action" onClick={logoutAll}>
                                                Выйти везде
                                            </button>
                                            <button className="button unauthorize" onClick={logout}>
                                                Выйти
                                            </button>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </>
                    ) : (
                        <>
                            <BurgerButton setIsActiveBurger={setIsActiveBurger} />
                            <NavLink to="/" className="logo_center">
                                <Logo Width="70px" Height="42px" />
                            </NavLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
});

export default Navbar;
