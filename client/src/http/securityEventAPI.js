import { $authHost } from './index';

const getList = async () => {
  const { data } = await $authHost.get('/api/admin/securityEvent');

  return (data || []).map((item) => ({
    ...item,
    detailsText: item.details || '',
  }));
};

export const securityEventAPI = {
  getList,
};
