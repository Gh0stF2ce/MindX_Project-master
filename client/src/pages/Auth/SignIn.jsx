import './auth.scss';
import { ROUTES } from '@mindx/utils/consts.js';
import { API } from '@mindx/http/API.js';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '@mindx/index.js';
import { ErrorEmmiter, SuccessEmmiter } from '@mindx/components/UI/Toastify/Notify.jsx';
import { mindxDebounce } from '@mindx/utils/tools';

const SignIn = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [emailHint, setEmailHint] = useState('');

  const completeAuth = (payload) => {
    user.setUser(payload.user);
    user.setIsAuth(true);
    if (payload.user.role === 'ADMIN') {
      user.setIsAdmin(true);
    }
    navigate(ROUTES.HOME_ROUTE);
    window.location.reload();
  };

  const signIn = mindxDebounce(async () => {
    try {
      const data = await API.user.SignIn(identifier.trim(), password);

      if (data?.requiresTwoFactor) {
        setChallengeToken(data.challengeToken);
        setEmailHint(data.email);
        SuccessEmmiter(data.message || 'Код отправлен на почту.');
        return;
      }

      if (data?.user) {
        completeAuth(data);
      }
    } catch (error) {
      ErrorEmmiter(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Не удалось выполнить вход.'
      );
    }
  });

  const verifyCode = mindxDebounce(async () => {
    try {
      const data = await API.user.VerifyTwoFactor(challengeToken, twoFactorCode, rememberDevice);
      completeAuth(data);
    } catch (error) {
      ErrorEmmiter(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Не удалось подтвердить код.'
      );
    }
  });

  return (
    <main className="auth-section">
      <div className="signin-section">
        <h1 className="auth-title">{challengeToken ? 'Подтверждение входа' : 'Вход'}</h1>
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          {!challengeToken ? (
            <>
              <div>
                <label htmlFor="identifier">Логин или email</label>
                <input
                  type="text"
                  required
                  id="identifier"
                  className="auth-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password">Пароль</label>
                <input
                  type="password"
                  required
                  id="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={60}
                />
              </div>
              <div className="btn-section">
                <a className="btn sign" href={ROUTES.SIGNUP_ROUTE}>
                  Нет аккаунта?
                </a>
                <button className="btn auth" onClick={signIn}>
                  Войти
                </button>
              </div>
            </>
          ) : (
            <>
              <p>Код отправлен на почту: <strong>{emailHint}</strong></p>
              <div>
                <label htmlFor="twoFactorCode">Код из письма</label>
                <input
                  type="text"
                  required
                  id="twoFactorCode"
                  className="auth-input"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <label className="remember-check">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                />
                Запомнить устройство на 30 дней
              </label>
              <div className="btn-section">
                <button
                  className="btn sign"
                  onClick={() => {
                    setChallengeToken('');
                    setTwoFactorCode('');
                    setRememberDevice(false);
                  }}
                >
                  Назад
                </button>
                <button className="btn auth" onClick={verifyCode}>
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

export default SignIn;
