const LOCAL_API_BASE_URL = 'http://localhost:8080/api/v1';
const PROD_API_BASE_URL = 'https://anubhab-s-portfolio.onrender.com/api/v1';
const API_PREFIX = '/api/v1';

function normalizeApiBaseUrl(url) {
  const trimmed = String(url || '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    return '';
  }

  return trimmed.endsWith(API_PREFIX) ? trimmed : `${trimmed}${API_PREFIX}`;
}

export function getApiBaseUrl() {
  const envUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl) {
    return normalizeApiBaseUrl(envUrl);
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    if (!isLocalHost) {
      return PROD_API_BASE_URL;
    }
  }

  return LOCAL_API_BASE_URL;
}
