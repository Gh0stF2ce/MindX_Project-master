import { $host, $authHost } from './index';

const getList = async () => {
	const { data } = await $authHost.get('/api/admin/question');
	return data;
};

const getById = async (id) => {
	const { data } = await $authHost.get(`/api/admin/question/${id}`);
	return data;
};

const update = async (model) => {
	const { data } = await $authHost.put(`/api/admin/question/${model.id}`, model);
	return data;
}

const deleteById = async (id) => {
	const { data } = await $authHost.delete(`/api/admin/question/${id}`);
	return data;
}

const addItem = async (item) => {
	const { data } = await $authHost.post(`/api/admin/question`, item);
  return data;
}

export const questionAPI = {
	getList,
	getById,
	update,
	deleteById,
	addItem,
};
