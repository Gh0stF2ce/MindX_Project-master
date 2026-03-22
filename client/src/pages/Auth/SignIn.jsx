import './auth.scss';
import { ROUTES } from '@mindx/utils/consts.js';
import { API } from '@mindx/http/API.js';
import { useContext, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '@mindx/index.js';
import { ErrorEmmiter } from '@mindx/components/UI/Toastify/Notify.jsx';
import { mindxDebounce } from '@mindx/utils/tools';

const SignIn = observer( () => {
  const { user } = useContext(Context);
  const navigate = useNavigate()
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const click = mindxDebounce(async () => {
    try {
      const data = await API.user.SignIn((username).trim(), password);
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
        'Не удалось выполнить вход. Проверьте, доступен ли сервер по сети.'
      );
    }
  });
  return ( 
    <main className='auth-section'>
      <div className="signin-section">
        <h1 className='auth-title'>Вход</h1>
        <form className='auth-form' onSubmit={e => e.preventDefault()}>
          <div>
            <label htmlFor='login'>Логин</label>
            <input type='text' required id='login' className='auth-input'
                  value={username} onChange={e => setUsername(e.target.value)}/>
          </div>
          <div>
            <label htmlFor='password'>Пароль</label>
            <input type='password' required id='password' className='auth-input'
                  value={password} onChange={e => setPassword(e.target.value)}
                  minLength={3} maxLength={30}
            />
          </div>
          <div className='btn-section'>
            <a className='btn sign' href={ROUTES.SIGNUP_ROUTE}>Нет аккаунта?</a>
            <button className='btn auth' onClick={click}>Войти</button>
          </div>
        </form>
      </div>
    </main>
  );
}
) 
export default SignIn;
