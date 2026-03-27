const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((acc, pair) => {
    const [rawKey, ...rest] = pair.trim().split('=');
    if (!rawKey) {
      return acc;
    }

    acc[rawKey] = decodeURIComponent(rest.join('=') || '');
    return acc;
  }, {});
};

module.exports = parseCookies;
