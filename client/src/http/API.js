import { questionAPI } from './questionAPI';
import { gameAPI } from './gameAPI';
import { themeAPI } from './themeAPI';
import { userAPI } from './userAPI';
import { userAnswerAPI } from './userAnswerAPI';
import { roleAPI } from './roleAPI';
import { imageAPI } from './imageAPI';
import { lobbyAPI } from './lobbyAPI';
import { ratingAPI } from './ratingAPI'

export const API = {
	question: questionAPI,
	game: gameAPI,
	theme: themeAPI,
	user: userAPI,
	userAnswer: userAnswerAPI,
	role: roleAPI,
	image: imageAPI,
	lobby: lobbyAPI,
	rating: ratingAPI,
};
