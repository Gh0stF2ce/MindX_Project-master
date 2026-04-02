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

export { $host, $authHost };
