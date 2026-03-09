import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { personalInfo, projects as fallbackProjects } from '../data/portfolioData';

const PortfolioContentContext = createContext({
  projects: fallbackProjects,
  socialLinks: personalInfo.socialLinks,
  resumes: [],
  loading: false,
  error: ''
});

export function PortfolioContentProvider({ children }) {
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1', []);
  const [projects, setProjects] = useState(fallbackProjects);
  const [socialLinks, setSocialLinks] = useState(personalInfo.socialLinks);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadContent() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl}/content`);
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || payload.success === false) {
          throw new Error(payload?.message || 'Failed to load portfolio content');
        }

        if (!active) {
          return;
        }

        if (Array.isArray(payload?.data?.projects) && payload.data.projects.length > 0) {
          setProjects(payload.data.projects);
        }

        if (Array.isArray(payload?.data?.socialLinks) && payload.data.socialLinks.length > 0) {
          setSocialLinks(payload.data.socialLinks);
        }

        if (Array.isArray(payload?.data?.resumes)) {
          setResumes(payload.data.resumes);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError.message || 'Failed to load portfolio content');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      active = false;
    };
  }, [apiBaseUrl]);

  const value = useMemo(
    () => ({
      projects,
      socialLinks,
      resumes,
      loading,
      error
    }),
    [projects, socialLinks, resumes, loading, error]
  );

  return <PortfolioContentContext.Provider value={value}>{children}</PortfolioContentContext.Provider>;
}

export function usePortfolioContent() {
  return useContext(PortfolioContentContext);
}
