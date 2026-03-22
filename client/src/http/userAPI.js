import { $host, $authHost } from './index';
import { jwtDecode } from 'jwt-decode';

const getList = async () => {
    const { data } = await $authHost.get('/api/admin/user');
    for(const user of data) {
        user.role_name = user.role.name;
    }
    return data;
};

const getById = async (id) => {
    const { data } = await $authHost.get(`/api/admin/user/${id}`);
    return data;
};

const SignIn = async (username, password) => {
    const { data } = await $host.post(`/api/user/signin`, { username, password });
    localStorage.setItem(`token`, data.token);
    return jwtDecode(data.token);
};

const SignUp = async (username, password, confirmPassword) => {
    const { data } = await $host.post(`/api/user/signup`, { username, password, confirmPassword });
    localStorage.setItem(`token`, data.token);
    return jwtDecode(data.token);
};

const check = async () => {
    const { data } = await $authHost.get(`/api/user/auth`);
    localStorage.setItem(`token`, data.token);
    return jwtDecode(data.token);
};

const update = async (model) => {
    const { data } = await $authHost.put(`/api/admin/user/${model.id}`, model);
    return data;
}

const addItem = async (item) => {
    const { data } = await $authHost.post(`/api/admin/user`, item);
    return data;
}

const deleteById = async (id) => {
    console.log(id);
	const { data } = await $authHost.delete(`/api/admin/user/${id}`);
	return data;
}

export const userAPI = {
  getList,
  getById,
  SignIn,
  SignUp,
  check,
  update,
  addItem,
  deleteById
};