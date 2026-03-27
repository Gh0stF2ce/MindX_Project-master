import './auth.scss';
import { ROUTES } from '../../utils/consts.js';
import { API } from '@mindx/http/API.js';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index.js';
import { ErrorEmmiter, SuccessEmmiter } from '../../components/UI/Toastify/Notify.jsx';
import { mindxDebounce } from '@mindx/utils/tools';

const SignUp = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);

  const completeAuth = (payload) => {
    user.setUser(payload.user);
    user.setIsAuth(true);
    if (payload.user.role === 'ADMIN') {
      user.setIsAdmin(true);
    }
    navigate(ROUTES.HOME_ROUTE);
    window.location.reload();
  };

  const signUp = mindxDebounce(async () => {
    try {
      const data = await API.user.SignUp(username.trim(), email.trim(), password, confirmPassword);
      setVerificationPending(Boolean(data?.requiresEmailVerification));
      SuccessEmmiter(data.message || 'Код отправлен на почту.');
    } catch (error) {
      ErrorEmmiter(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Не удалось выполнить регистрацию.'
      );
    }
  });

  const verifyEmail = mindxDebounce(async () => {
    try {
      const data = await API.user.VerifyEmail(email.trim(), verificationCode.trim());
      completeAuth(data);
    } catch (error) {
      ErrorEmmiter(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Не удалось подтвердить почту.'
      );
    }
  });

  const resendCode = async () => {
    try {
      const data = await API.user.resendVerification(email.trim());
      SuccessEmmiter(data.message);
    } catch (error) {
      ErrorEmmiter(error?.response?.data?.error || 'Не удалось отправить код повторно.');
    }
  };

  return (
    <main className="auth-section">
      <div className="signup-section">
        <h1 className="auth-title">{verificationPending ? 'Подтверждение почты' : 'Регистрация'}</h1>
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          {!verificationPending ? (
            <>
              <div>
                <label htmlFor="login">Логин</label>
                <input
                  type="text"
                  id="login"
                  className="auth-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  minLength={3}
                  maxLength={30}
                />
              </div>
              <div>
                <label htmlFor="email">Почта</label>
                <input
                  type="email"
                  id="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password">Пароль</label>
                <input
                  type="password"
                  id="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={60}
                />
              </div>
              <div>
                <label htmlFor="repeat_password">Повторите пароль</label>
                <input
                  type="password"
                  id="repeat_password"
                  className="auth-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  maxLength={60}
                />
              </div>
              <div className="btn-section">
                <a className="btn sign" href={ROUTES.SIGNIN_ROUTE}>
                  Уже есть аккаунт?
                </a>
                <button className="btn auth" onClick={signUp}>
                  Зарегистрироваться
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                Мы отправили код подтверждения на почту: <strong>{email}</strong>
              </p>
              <div>
                <label htmlFor="verification_code">Код подтверждения</label>
                <input
                  type="text"
                  id="verification_code"
                  className="auth-input"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <div className="btn-section">
                <button className="btn sign" onClick={resendCode}>
                  Отправить код ещё раз
                </button>
                <button className="btn auth" onClick={verifyEmail}>
                  Подтвердить
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
});

export default SignUp;
