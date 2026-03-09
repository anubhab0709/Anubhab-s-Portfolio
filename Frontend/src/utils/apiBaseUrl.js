const LOCAL_API_BASE_URL = 'http://localhost:8080/api/v1';
const PROD_API_BASE_URL = 'https://anubhab-s-portfolio.onrender.com/api/v1';

export function getApiBaseUrl() {
  const envUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return PROD_API_BASE_URL;
  }

  return LOCAL_API_BASE_URL;
}
