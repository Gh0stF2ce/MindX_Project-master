import './auth.scss'
import { ROUTES } from '../../utils/consts.js';
import { API } from '@mindx/http/API.js';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index.js';
import { ErrorEmmiter } from '../../components/UI/Toastify/Notify.jsx';
import { mindxDebounce } from '@mindx/utils/tools';

const SignUp = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate()
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const click = mindxDebounce(async () => {
    try {
      const data = await API.user.SignUp((username).trim(), password, confirmPassword);
      if (data) {
        user.setUser(data);
        user.setIsAuth(true);
        navigate(ROUTES.HOME_ROUTE);
        window.location.reload();
      }
    } catch(error) {
      console.error(error);
      ErrorEmmiter(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Не удалось выполнить регистрацию. Проверьте, доступен ли сервер по сети.'
      );
    }
  });
  return ( 
    <main className='auth-section'>
      <div className="signup-section">
      <h1 className='auth-title'>Регистрация</h1>
        <form className='auth-form' onSubmit={e => e.preventDefault()}>
          <div>
            <label htmlFor='login'>Логин</label>
            <input type='text' id='login' className='auth-input'
                  value={username} onChange={e => setUsername(e.target.value)}
                  minLength={3} maxLength={30}
            />
          </div>
          <div>
            <label htmlFor='password'>Пароль</label>
            <input type='password' id='password' className='auth-input'
                  value={password} onChange={e => setPassword(e.target.value)}
                  minLength={3} maxLength={30}
            />
          </div>
          <div>
            <label htmlFor='repeat_password'>Повторите пароль</label>
            <input type='password' id='repeat_password' className='auth-input'
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  minLength={3} maxLength={30}
            />
          </div>
          <div className='btn-section'>
            <a className='btn sign' href={ROUTES.SIGNIN_ROUTE}>Уже есть аккаунт?</a>
            <button className='btn auth' onClick={click}>Зарегистриоваться</button>
          </div>
        </form>
      </div>
    </main>
  );
});
 
export default SignUp;
