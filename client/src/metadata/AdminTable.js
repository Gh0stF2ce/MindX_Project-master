import { API } from '@mindx/http/API';

const questionTemplate = {
	type: 'question',
	label: 'Вопросы',
	api: API.question,
	fileds: [
		{ type: 'question', label: 'Вопрос', meta: 'string' },
		{ type: 'answer', label: 'Ответ', meta: 'string' },
		{ type: 'imageId', label: 'Изображение', meta: 'img' },
	],
};

const gameTemplate = {
	type: 'game',
	label: 'Игры',
	api: API.game,
	fileds: [
		{ type: 'typeGame', label: 'Тип', meta: 'string' },
		{ type: 'name', label: 'Название', meta: 'string' },
		{ type: 'schoolClass', label: 'Класс', meta: 'string' },
		{ type: 'startDate', label: 'Дата начала', meta: 'datetime' },
		{ type: 'endDate', label: 'Дата окончания', meta: 'datetime' },
		{ type: 'imageId', label: 'Изображение', meta: 'img' },
	],
};

const themeTemplate = {
	type: 'theme',
	label: 'Темы',
	api: API.theme,
	fileds: [
		{ type: 'name', label: 'Название', meta: 'string' },
	],
};

const userTemplate = {
	type: 'user',
	label: 'Пользователи',
	api: API.user,
	fileds: [
		{ type: 'username', label: 'Имя пользователя', meta: 'string' },
		{ type: 'role_name', label: 'Роль', meta: 'string'}
	],
};

const roleTemplate = {
	type: 'role',
  label: 'Роли',
  api: API.role,
  fileds: [
    { type: 'name', label: 'Название', meta: 'string' },
  ],
};

const imageTemplate = {
	type: 'image',
  label: 'Изображения',
  api: API.image,
  fileds: [
    { type: 'id', label: 'Изображение', meta: 'img' },
  ],
};

const securityEventTemplate = {
	type: 'securityEvent',
	label: 'Аудит',
	api: API.securityEvent,
	fileds: [
		{ type: 'createdAtText', label: 'Дата', meta: 'string' },
		{ type: 'actionText', label: 'Событие', meta: 'string' },
		{ type: 'statusText', label: 'Статус', meta: 'string' },
		{ type: 'username', label: 'Пользователь', meta: 'string' },
		{ type: 'targetTypeText', label: 'Тип цели', meta: 'string' },
		{ type: 'targetIdText', label: 'ID цели', meta: 'string' },
		{ type: 'ipAddressText', label: 'IP', meta: 'string' },
		{ type: 'detailsText', label: 'Детали', meta: 'string' },
	],
	settings: {
		off_CUD: true,
	},
};

export const templates = {
	question: questionTemplate,
	game: gameTemplate,
	theme: themeTemplate,
	user: userTemplate,
	securityEvent: securityEventTemplate,
	role: roleTemplate,
	image: imageTemplate,
};
