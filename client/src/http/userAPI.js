import { $host, $authHost } from './index';

const getList = async () => {
  const { data } = await $authHost.get('/api/admin/user');
  for (const user of data) {
    user.role_name = user.role.name;
  }
  return data;
};

const getById = async (id) => {
  const { data } = await $authHost.get(`/api/admin/user/${id}`);
  return data;
};

const SignIn = async (identifier, password) => {
  const { data } = await $host.post('/api/user/signin', { identifier, password });
  return data;
};

const VerifyTwoFactor = async (challengeToken, code, rememberDevice) => {
  const { data } = await $host.post('/api/user/verify-2fa', {
    challengeToken,
    code,
    rememberDevice,
  });
  return data;
};

const SignUp = async (username, email, password, confirmPassword) => {
  const { data } = await $host.post('/api/user/signup', {
    username,
    email,
    password,
    confirmPassword,
  });
  return data;
};

const VerifyEmail = async (email, code) => {
  const { data } = await $host.post('/api/user/verify-email', { email, code });
  return data;
};

const resendVerification = async (email) => {
  const { data } = await $host.post('/api/user/resend-verification', { email });
  return data;
};

const forgotPassword = async (email) => {
  const { data } = await $host.post('/api/user/forgot-password', { email });
  return data;
};

const resetPassword = async (email, code, password, confirmPassword) => {
  const { data } = await $host.post('/api/user/reset-password', {
    email,
    code,
    password,
    confirmPassword,
  });
  return data;
};

const check = async () => {
  const { data } = await $authHost.get('/api/user/auth');
  return data.user;
};

const getProfile = async () => {
  const { data } = await $authHost.get('/api/user/profile');
  return data;
};

const getSessions = async () => {
  const { data } = await $authHost.get('/api/user/sessions');
  return data;
};

const logoutSession = async (sessionId) => {
  const { data } = await $authHost.delete(`/api/user/sessions/${sessionId}`);
  return data;
};

const updateProfile = async (model) => {
  const { data } = await $authHost.put('/api/user/profile', model);
  return data;
};

const logout = async () => {
  const { data } = await $authHost.post('/api/user/logout');
  return data;
};

const logoutAll = async () => {
  const { data } = await $authHost.post('/api/user/logout-all');
  return data;
};

const logoutAllUsers = async () => {
  const { data } = await $authHost.post('/api/admin/user/logout-all-sessions');
  return data;
};

const update = async (model) => {
  const { data } = await $authHost.put(`/api/admin/user/${model.id}`, model);
  return data;
};

const addItem = async (item) => {
  const { data } = await $authHost.post('/api/admin/user', item);
  return data;
};

const deleteById = async (id) => {
  const { data } = await $authHost.delete(`/api/admin/user/${id}`);
  return data;
};

export const userAPI = {
  getList,
  getById,
  SignIn,
  VerifyTwoFactor,
  SignUp,
  VerifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  check,
  getProfile,
  getSessions,
  logoutSession,
  updateProfile,
  logout,
  logoutAll,
  logoutAllUsers,
  update,
  addItem,
  deleteById,
};
