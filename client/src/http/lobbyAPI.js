import { $host, $authHost } from './index';

const getList = async (type) => {
	const { data } = await $authHost.get(`/api/lobby?typeGame=${type}`);
	return data;
};

export const lobbyAPI = {
	getList,
};
