import './userSettingsModal.scss';
import { useEffect, useState } from 'react';
import { API } from '@mindx/http/API';
import { ErrorEmmiter, SuccessEmmiter } from '@mindx/components/UI/Toastify/Notify';

const UserSettingsModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    isTwoFactorEnabled: false,
    isEmailVerified: true,
  });
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setLoading(true);
    API.user
      .getProfile()
      .then((data) => {
        setForm({
          username: data.username || '',
          email: data.email || '',
          password: '',
          confirmPassword: '',
          isTwoFactorEnabled: Boolean(data.isTwoFactorEnabled),
          isEmailVerified: Boolean(data.isEmailVerified),
        });
      })
      .catch((error) => {
        ErrorEmmiter(error?.response?.data?.error || 'Не удалось загрузить настройки.');
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
      };

      if (form.password.trim()) {
        payload.password = form.password;
        payload.confirmPassword = form.confirmPassword;
      }

      const previousEmail = form.email.trim();
      const response = await API.user.updateProfile(payload);
      SuccessEmmiter(response.message || 'Настройки сохранены.');

      if (response.message?.includes('Подтвердите новую почту')) {
        setForm((prev) => ({
          ...prev,
          email: previousEmail,
          isEmailVerified: false,
          password: '',
          confirmPassword: '',
        }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    } catch (error) {
      ErrorEmmiter(error?.response?.data?.error || 'Не удалось сохранить настройки.');
    }
  };

  const saveTwoFactorSettings = async () => {
    try {
      const response = await API.user.updateProfile({
        isTwoFactorEnabled: form.isTwoFactorEnabled,
      });
      SuccessEmmiter(response.message || 'Настройка двухэтапной аутентификации сохранена.');
    } catch (error) {
      ErrorEmmiter(error?.response?.data?.error || 'Не удалось сохранить настройку двухэтапной аутентификации.');
    }
  };

  const verifyEmail = async () => {
    try {
      const response = await API.user.VerifyEmail(form.email.trim(), verificationCode.trim());
      SuccessEmmiter(response.message || 'Почта подтверждена.');
      setForm((prev) => ({ ...prev, isEmailVerified: true }));
      setVerificationCode('');
      localStorage.setItem('token', response.token);
      window.location.reload();
    } catch (error) {
      ErrorEmmiter(error?.response?.data?.error || 'Не удалось подтвердить почту.');
    }
  };

  const resendCode = async () => {
    try {
      const response = await API.user.resendVerification(form.email.trim());
      SuccessEmmiter(response.message);
    } catch (error) {
      ErrorEmmiter(error?.response?.data?.error || 'Не удалось отправить код повторно.');
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Настройки пользователя</h2>
          <button type="button" onClick={onClose}>
            x
          </button>
        </div>

        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <div className="settings-form">
            <label>
              Логин
              <input
                type="text"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
              />
            </label>

            <label>
              Почта
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </label>

            <label>
              Новый пароль
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
            </label>

            <label>
              Повторите пароль
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
              />
            </label>

            <label className="settings-check">
              <input
                type="checkbox"
                checked={form.isTwoFactorEnabled}
                onChange={(e) => handleChange('isTwoFactorEnabled', e.target.checked)}
              />
              Включить двухэтапную аутентификацию
            </label>

            <div className="settings-actions settings-actions--between">
              <span className="settings-hint">Эта кнопка сохраняет только настройку 2FA.</span>
              <button type="button" className="primary-btn" onClick={saveTwoFactorSettings}>
                Сохранить 2FA
              </button>
            </div>

            {!form.isEmailVerified && (
              <div className="email-verification-box">
                <p>Почта не подтверждена. Введите код из письма.</p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Код подтверждения"
                />
                <div className="settings-actions">
                  <button type="button" className="secondary-btn" onClick={resendCode}>
                    Отправить код ещё раз
                  </button>
                  <button type="button" className="primary-btn" onClick={verifyEmail}>
                    Подтвердить почту
                  </button>
                </div>
              </div>
            )}

            <div className="settings-actions">
              <button type="button" className="secondary-btn" onClick={onClose}>
                Закрыть
              </button>
              <button type="button" className="primary-btn" onClick={saveSettings}>
                Сохранить профиль
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettingsModal;
