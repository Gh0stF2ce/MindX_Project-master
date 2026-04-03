import { $authHost } from './index';

const ACTION_LABELS = {
  'auth.signin': 'Вход',
  'auth.signin.challenge': 'Запрос 2FA',
  'auth.signin.2fa_success': 'Успешный вход по 2FA',
  'auth.signin.2fa_failure': 'Ошибка 2FA',
  'auth.signup': 'Регистрация',
  'auth.verify_email': 'Подтверждение почты',
  'auth.resend_verification': 'Повторная отправка кода',
  'auth.password_reset.request': 'Запрос сброса пароля',
  'auth.password_reset.complete': 'Сброс пароля',
  'auth.logout': 'Выход',
  'auth.logout_all': 'Выход со всех устройств',
  'auth.logout_session': 'Завершение одной сессии',
  'user.profile.update': 'Обновление профиля',
  'user.email.change': 'Смена почты',
  'admin.user.create': 'Создание пользователя',
  'admin.user.update': 'Изменение пользователя',
  'admin.user.delete': 'Удаление пользователя',
  'admin.user.logout_all_sessions': 'Завершение всех сессий',
  'security.suspicious.login_failures': 'Подозрительные ошибки входа',
  'security.suspicious.email_change_frequency': 'Частая смена почты',
  'security.suspicious.mass_requests': 'Массовые запросы',
};

const STATUS_LABELS = {
  success: 'Успешно',
  failure: 'Ошибка',
  warning: 'Предупреждение',
};

const TARGET_TYPE_LABELS = {
  user: 'Пользователь',
  session: 'Сессия',
  route: 'Маршрут',
};

const DETAIL_LABELS = {
  rememberDevice: 'Запомнить устройство',
  trustedDevice: 'Доверенное устройство',
  viaTrustedDevice: 'Через доверенное устройство',
  sessionId: 'ID сессии',
  userAgent: 'Устройство',
  reason: 'Причина',
  email: 'Почта',
  username: 'Логин',
  ip: 'IP',
  ipAddress: 'IP',
  route: 'Маршрут',
  method: 'Метод',
  attempts: 'Количество попыток',
  lockUntil: 'Блокировка до',
  oldEmail: 'Старая почта',
  newEmail: 'Новая почта',
  fields: 'Изменённые поля',
  changedFields: 'Изменённые поля',
  targetUsername: 'Целевой пользователь',
  targetUserId: 'ID пользователя',
  limit: 'Лимит',
  windowMs: 'Окно лимита',
  codeType: 'Тип кода',
  expiresAt: 'Действует до',
};

const prettifyDetailKey = (key) => {
  if (!key) {
    return '-';
  }

  if (DETAIL_LABELS[key]) {
    return DETAIL_LABELS[key];
  }

  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());
};

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

const normalizeIp = (ip) => {
  if (!ip) {
    return '-';
  }

  if (ip === '::1') {
    return '127.0.0.1';
  }

  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }

  return ip;
};

const formatBoolean = (value) => (value ? 'Да' : 'Нет');

const formatDetailValue = (key, value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'boolean') {
    return formatBoolean(value);
  }

  if (key === 'ip' || key === 'ipAddress') {
    return normalizeIp(String(value));
  }

  if (typeof value === 'number' && key === 'windowMs') {
    const minutes = Math.round(value / 60000);
    return minutes > 0 ? `${minutes} мин.` : `${value} мс`;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const looksLikeDate =
      key.toLowerCase().includes('date') ||
      key.toLowerCase().includes('time') ||
      key.toLowerCase().includes('until') ||
      key.toLowerCase().includes('expires');

    if (looksLikeDate) {
      const date = new Date(trimmed);
      if (!Number.isNaN(date.getTime())) {
        return formatDateTime(trimmed);
      }
    }

    return trimmed;
  }

  if (Array.isArray(value)) {
    return value.join(', ') || '-';
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([nestedKey, nestedValue]) => `${prettifyDetailKey(nestedKey)}: ${formatDetailValue(nestedKey, nestedValue)}`)
      .join(', ');
  }

  return String(value);
};

const formatDetails = (details) => {
  if (!details) {
    return '-';
  }

  try {
    const parsed = typeof details === 'string' ? JSON.parse(details) : details;
    return Object.entries(parsed)
      .map(([key, value]) => `${prettifyDetailKey(key)}: ${formatDetailValue(key, value)}`)
      .join('; ');
  } catch {
    return String(details);
  }
};

const prettifyAction = (action) => ACTION_LABELS[action] || action?.replaceAll('.', ' / ') || '-';

const formatTargetId = (targetType, targetId) => {
  if (!targetId) {
    return '-';
  }

  const value = String(targetId).trim();

  if (targetType === 'route') {
    return value;
  }

  if (value.length > 18) {
    return `${value.slice(0, 8)}...${value.slice(-4)}`;
  }

  return value;
};

const getList = async () => {
  const { data } = await $authHost.get('/api/admin/securityEvent');

  return (data || []).map((item) => ({
    ...item,
    createdAtText: formatDateTime(item.createdAt),
    actionText: prettifyAction(item.action),
    statusText: STATUS_LABELS[item.status] || item.status || '-',
    targetTypeText: TARGET_TYPE_LABELS[item.targetType] || item.targetType || '-',
    targetIdText: formatTargetId(item.targetType, item.targetId),
    ipAddressText: normalizeIp(item.ipAddress),
    detailsText: formatDetails(item.details),
  }));
};

export const securityEventAPI = {
  getList,
};
