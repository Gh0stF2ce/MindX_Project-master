import axios from 'axios';
import { getApiHost } from '@mindx/utils/apiHost';

const apiHost = getApiHost();

const $host = axios.create({
	baseURL: apiHost,
	withCredentials: true,
});

const $authHost = axios.create({
	baseURL: apiHost,
	withCredentials: true,
});

const authInterceptor = (config) => {
	config.headers.authorization = `Bearer ${localStorage.getItem('token')}`;
	return config;
};

$authHost.interceptors.request.use(authInterceptor);

export { $host, $authHost };
