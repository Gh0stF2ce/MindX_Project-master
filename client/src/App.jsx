import '@mindx/styles/main.css';

import { useEffect, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import Navbar from '@mindx/components/Navbar/Navbar';
import Footer from '@mindx/components/Footer/Footer';
import BurgerMenu from '@mindx/components/BurgerMenu/BurgerMenu';
import AppRouter from '@mindx/components/AppRouter';
import Loading from '@mindx/components/UI/Loading/Loading';
import { Notify } from '@mindx/components/UI/Toastify/Notify';

import { Context } from '@mindx/index';
import { API } from '@mindx/http/API';

const App = observer(() => {
  const [isActiveBurger, setIsActiveBurger] = useState(false);
  const { user } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); 
  const navigate = useNavigate();

  useEffect(() => {
    API.user.check()
      .then(data => {
        user.setUser(data);
        user.setIsAuth(true);
        if (data.role === 'ADMIN') {
          user.setIsAdmin(true);
        }
      })
      .catch((error) => {
        user.logout();
        localStorage.setItem(`token`, null);
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    sessionStorage.setItem('lastPath', location.pathname);
  }, [location]);

  useEffect(() => {
    const savedPath = sessionStorage.getItem('lastPath');
    if (savedPath && savedPath !== location.pathname) {
      navigate(savedPath, { replace: true });
    }
  }, [navigate, location.pathname]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='App'>
      <Notify />
      <BurgerMenu
        isActiveBurger={isActiveBurger}
        setIsActiveBurger={setIsActiveBurger}
      />
      <Navbar
        isActiveBurger={isActiveBurger}
        setIsActiveBurger={setIsActiveBurger}
      />
      <AppRouter />
      <Footer />
    </div>
  );
});

export default App;