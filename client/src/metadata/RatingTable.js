import { API } from '@mindx/http/API';

const ratingTemplate = {
	type: 'rating',
	label: 'Игры',
	api: API.rating,
	fileds: [
		{ type: 'position', label: '№', meta: 'number' },
		{ type: 'username', label: 'Имя пользователя', meta: 'string' },
		{ type: 'pointsBonuses', label: 'Бонусы', meta: 'number' },
		{ type: 'totalPoints', label: 'Всего очков', meta: 'number' },
		{ type: 'userAnswers', label: 'Ответы', meta: 'question-list' },
	],
};

export const templates = {
  rating: ratingTemplate,
};