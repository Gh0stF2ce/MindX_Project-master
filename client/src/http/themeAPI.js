import { $host, $authHost } from './index';

const getList = async () => {
	const { data } = await $authHost.get('/api/admin/theme');
	return data;
};

const getById = async (id) => {
	const { data } = await $authHost.get(`/api/admin/theme/${id}`);
	return data;
};

const update = async (model) => {
	const { data } = await $authHost.put(`/api/admin/theme/${model.id}`, model);
	return data;
}

const deleteById = async (id) => {
	const { data } = await $authHost.delete(`/api/admin/theme/${id}`);
	return data;
}

const addItem = async (item) => {
	const { data } = await $authHost.post(`/api/admin/theme`, item);
  return data;
}

export const themeAPI = {
	getList,
	getById,
	update,
	deleteById,
	addItem,
};
