const DEFAULT_API_PORT = '5000';

const isLocalHost = (host) => host === 'localhost' || host === '127.0.0.1';

export const getApiHost = () => {
  const envHost = process.env.REACT_APP_HOST || process.env.REACT_APP_API_URL;

  if (typeof window === 'undefined') {
    return envHost || `http://localhost:${DEFAULT_API_PORT}`;
  }

  const currentProtocol = window.location.protocol;
  const currentHost = window.location.hostname;

  if (!envHost) {
    return `${currentProtocol}//${currentHost}:${DEFAULT_API_PORT}`;
  }

  try {
    const parsed = new URL(envHost);

    if (isLocalHost(parsed.hostname) && !isLocalHost(currentHost)) {
      const port = parsed.port ? `:${parsed.port}` : '';
      return `${parsed.protocol}//${currentHost}${port}`;
    }

    return parsed.toString().replace(/\/$/, '');
  } catch {
    return envHost;
  }
};
