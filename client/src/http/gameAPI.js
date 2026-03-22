import { $host, $authHost } from './index';

const getList = async () => {
	const { data } = await $authHost.get('/api/admin/game');
	for (const game of data) {
		game.accessGames = (game.accessGames || []).map((item) => item.role);
		game.schoolClass = game?.invadersData?.schoolClass ? String(game.invadersData.schoolClass) : '';

		if (game.typeGame === 'square') {
			game.themeGames = (game.themeGames || []).map((item) => item.theme);
			const questionArray = [];
			const chunkSize = 5;
			for (let i = 0; i < (game.questionGames || []).length; i += chunkSize) {
				const chunk = game.questionGames.slice(i, i + chunkSize);
				const questionsChunk = chunk.map(item => item.question);
				questionArray.push(questionsChunk);
			}
			game.questionGames = questionArray;
		} else if (game.typeGame === 'carousel') {
			game.countQuestionsOfCarousel = game?.questionGames?.length || 0;
			game.scoreFailure = JSON.parse(JSON.stringify(game?.carouselData?.scoreFailure));
			game.scoreFirst	= JSON.parse(JSON.stringify(game?.carouselData?.scoreFirst));
			game.scoreSuccess	= JSON.parse(JSON.stringify(game?.carouselData?.scoreSuccess));
			game.questionGames = (game.questionGames || []).map(item => item.question);
			delete game.carouselData;
		} else {
			game.questionGames = game.questionGames || [];
			game.themeGames = game.themeGames || [];
		}
	};
	return data;
};

const getById = async (id) => {
	const { data } = await $authHost.get(`/api/admin/game/${id}`);
	data.schoolClass = data?.invadersData?.schoolClass ? String(data.invadersData.schoolClass) : '';
	return data;
};

const getByIdUser = async (id) => {
	const { data } = await $authHost.get(`/api/game/${id}`);
	data.schoolClass = data?.invadersData?.schoolClass ? String(data.invadersData.schoolClass) : '';

	if (data.typeGame === 'square') {
		const questionArray = [];
		const chunkSize = 5;
		for (let i = 0; i < data.questionGames.length; i += chunkSize) {
			const chunk = data.questionGames.slice(i, i + chunkSize);
			questionArray.push(chunk);
		}
		data.questionGames = questionArray;
	}
	return data;
};

const postAnswer = async ({gameId, body}) => {
	const { data } = await $authHost.post(`/api/game/${gameId}`, body);
  return data;
}

const joinInvaders = async (gameId) => {
	const { data } = await $authHost.post(`/api/game/${gameId}/invaders/join`);
	return data;
};

const readyInvaders = async (gameId, body) => {
	const { data } = await $authHost.post(`/api/game/${gameId}/invaders/ready`, body);
	return data;
};

const getInvadersState = async (gameId) => {
	const { data } = await $authHost.get(`/api/game/${gameId}/invaders/state`);
	return data;
};

const moveInvaders = async (gameId, body) => {
	const { data } = await $authHost.post(`/api/game/${gameId}/invaders/move`, body);
	return data;
};

const spendInvaders = async (gameId, body) => {
	const { data } = await $authHost.post(`/api/game/${gameId}/invaders/spend`, body);
	return data;
};

const captureInvaders = async (gameId, body) => {
	const { data } = await $authHost.post(`/api/game/${gameId}/invaders/capture`, body);
	return data;
};

const answerInvaders = async (gameId, body) => {
	const { data } = await $authHost.post(`/api/game/${gameId}/invaders/answer`, body);
	return data;
};

const timeoutInvaders = async (gameId) => {
	const { data } = await $authHost.post(`/api/game/${gameId}/invaders/timeout`);
	return data;
};

const update = async (item) => {
	item.questionGames = Array.isArray(item.questionGames) ? item.questionGames.flat() : [];
	if (item.typeGame === 'carousel') {
		item.carouselData = {
			scoreFirst: item?.scoreFirst,
			scoreSuccess: item?.scoreSuccess,
			scoreFailure: item?.scoreFailure,
		}
	} else {
		delete item.carouselData;
	}
	if (item.typeGame === 'invaders') {
		item.invadersData = {
			schoolClass: item?.schoolClass,
		}
	} else {
		delete item.invadersData;
	}
	const { data } = await $authHost.put(`/api/admin/game/${item.id}`, item);
	return data;
}

const deleteById = async (id) => {
	const { data } = await $authHost.delete(`/api/admin/game/${id}`);
	return data;
}

const addItem = async (item) => {
	item.questionGames = Array.isArray(item.questionGames) ? item.questionGames.flat() : [];
	if (item.typeGame === 'carousel') {
		item.carouselData = {
			scoreFirst: item?.scoreFirst,
			scoreSuccess: item?.scoreSuccess,
			scoreFailure: item?.scoreFailure,
		}
	} else {
		delete item.carouselData;
	}
	if (item.typeGame === 'invaders') {
		item.invadersData = {
			schoolClass: item?.schoolClass,
		}
	} else {
		delete item.invadersData;
	}
	const { data } = await $authHost.post(`/api/admin/game`, item);
  return data;
}

export const gameAPI = {
	getList,
	getById,
	getByIdUser,
	update,
	deleteById,
	addItem,
	postAnswer,
	joinInvaders,
	readyInvaders,
	getInvadersState,
	moveInvaders,
	spendInvaders,
	captureInvaders,
	answerInvaders,
	timeoutInvaders,
};
