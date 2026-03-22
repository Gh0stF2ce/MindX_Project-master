import { $host, $authHost } from './index';

const getList = async () => {
	const { data } = await $authHost.get('/api/rating');
	return data;
};

const getById = async (id) => {
	const { data } = await $authHost.get(`/api/rating/${id}`);
	for (let i = 0; i < data.rating.length; i++) {
		data.rating[i].position = i + 1;
	}
	return data;
};

export const ratingAPI = {
	getList,
	getById,
};
