import { $host, $authHost } from './index';

const getList = async () => {
	const { data } = await $authHost.get('/api/admin/image');
	return data;
};

const getById = async (id) => {
	const { data } = await $authHost.get(`/api/admin/image/${id}`);
	return data;
};

const update = async (model) => {
	const { data } = await $authHost.put(`/api/admin/image/${model.id}`, model.formData);
	return data;
}

const deleteById = async (id) => {
	const { data } = await $authHost.delete(`/api/admin/image/${id}`);
	return data;
}

const addItem = async (item) => {
	const { data } = await $authHost.post(`/api/admin/image`, item.formData);
  return data;
}

export const imageAPI = {
	getList,
	getById,
	update,
	deleteById,
	addItem,
};
