import './model.scss';
import { useState, useEffect } from 'react';
import CatalogRef from '@mindx/components/UI/CatalogRef/CatalogRef';

const User = (props) => {
  const { model } = props;
  const [username, setUsername] = useState(model?.username || '');
  const [email, setEmail] = useState(model?.email || '');
  const [password, setPassword] = useState(model?.password || '');
  const [confirmPassword, setConfirmPassword] = useState(model?.password || '');
  const [roleId, setRoleId] = useState(model?.role ? model.role.id : null);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(Boolean(model?.isTwoFactorEnabled));
  const [isEmailVerified, setIsEmailVerified] = useState(
    typeof model?.isEmailVerified === 'boolean' ? model.isEmailVerified : true
  );

  useEffect(() => {
    model.username = username.trim();
  }, [username]);

  useEffect(() => {
    model.email = email.trim();
  }, [email]);

  useEffect(() => {
    model.password = password || null;
  }, [password]);

  useEffect(() => {
    model.confirmPassword = confirmPassword || null;
  }, [confirmPassword]);

  useEffect(() => {
    model.roleId = roleId;
  }, [roleId]);

  useEffect(() => {
    model.isTwoFactorEnabled = isTwoFactorEnabled;
  }, [isTwoFactorEnabled]);

  useEffect(() => {
    model.isEmailVerified = isEmailVerified;
  }, [isEmailVerified]);

  return (
    <div className="model-section">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="group-label">
          <label>Имя пользователя</label>
          <input
            type="text"
            placeholder="Имя пользователя..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={30}
          />
        </div>
        <div className="group-label">
          <label>Почта</label>
          <input
            type="email"
            placeholder="Почта..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="group-label">
          <label>Пароль</label>
          <input
            type="password"
            placeholder="Пароль..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={60}
          />
        </div>
        <div className="group-label">
          <label>Повторите пароль</label>
          <input
            type="password"
            placeholder="Повторите пароль..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            maxLength={60}
          />
        </div>
        <div className="group-label">
          <label>Роль</label>
          <CatalogRef
            size={1}
            defaultValue={model.role ? model.role : null}
            onChange={setRoleId}
            url={'role'}
            path={'name'}
            placeholder="Выберите роль..."
            returnValue="value"
          />
        </div>
        <div className="group-label checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={isTwoFactorEnabled}
              onChange={(e) => setIsTwoFactorEnabled(e.target.checked)}
            />
            Включить двухэтапную аутентификацию
          </label>
        </div>
        <div className="group-label checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={isEmailVerified}
              onChange={(e) => setIsEmailVerified(e.target.checked)}
            />
            Почта подтверждена
          </label>
        </div>
      </form>
    </div>
  );
};

export default User;
