const windowConfig =
  typeof window !== 'undefined' && window.__APP_CONFIG__
    ? window.__APP_CONFIG__
    : {};

const pickString = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

const pickNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeBaseUrl = (value) => {
  const resolved = pickString(value, '/api');
  return resolved.endsWith('/') ? resolved.slice(0, -1) : resolved;
};

export const appRuntimeConfig = {
  appTitle: pickString(
    windowConfig.APP_TITLE,
    import.meta.env.VITE_APP_TITLE,
    'Integration Hub'
  ),
  appEnv: pickString(
    windowConfig.APP_ENV,
    import.meta.env.VITE_APP_ENV,
    'development'
  ),
  apiBaseUrl: normalizeBaseUrl(
    pickString(windowConfig.API_BASE_URL, import.meta.env.VITE_API_BASE_URL, '/api')
  ),
  apiTimeoutMs: pickNumber(
    windowConfig.API_TIMEOUT_MS ?? import.meta.env.VITE_API_TIMEOUT_MS,
    30000
  ),
};

export default appRuntimeConfig;
