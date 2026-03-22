import { $host, $authHost } from './index';

const getList = async () => {
	const { data } = await $authHost.get('/api/admin/role');
	return data;
};

const getById = async (id) => {
	const { data } = await $authHost.get(`/api/admin/role/${id}`);
	return data;
};

const update = async (model) => {
	const { data } = await $authHost.put(`/api/admin/role/${model.id}`, model);
	return data;
}

const deleteById = async (id) => {
	const { data } = await $authHost.delete(`/api/admin/role/${id}`);
	return data;
}

const addItem = async (item) => {
	const { data } = await $authHost.post(`/api/admin/role`, item);
  return data;
}

export const roleAPI = {
	getList,
	getById,
	update,
	deleteById,
	addItem,
};
