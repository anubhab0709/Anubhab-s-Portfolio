import { useMemo, useState } from 'react';
import { usePortfolioContent } from '../context/contentContext';
import '../styles/project-detail-page.css';

const stackIconMap = {
  'React.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  'Express.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
  MongoDB: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  MERN: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  Python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  TensorFlow: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg',
  Django: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
  REST: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',
  'REST API': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg'
};

function ProjectDetailPage() {
  const { projects } = usePortfolioContent();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const projectId = useMemo(() => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return decodeURIComponent(parts[parts.length - 1] || '');
  }, []);

  const project = useMemo(() => projects.find((item) => String(item.id) === projectId), [projectId, projects]);

  if (!project) {
    return (
      <main className="project-detail-page">
        <header className="project-detail-nav">
          <a className="project-detail-logo" href="/">A.B</a>
          <div className="project-detail-nav-actions">
            <a className="project-detail-back" href="/projects">Back to Projects</a>
            <a className="project-detail-back" href="/guestbook">Guestbook</a>
          </div>
          <button
            className={`project-detail-hamburger ${mobileNavOpen ? 'open' : ''}`}
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileNavOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className={`project-detail-mobile-menu ${mobileNavOpen ? 'open' : ''}`}>
            <a className="project-detail-back" href="/projects" onClick={() => setMobileNavOpen(false)}>
              Projects
            </a>
            <a className="project-detail-back" href="/guestbook" onClick={() => setMobileNavOpen(false)}>
              Guestbook
            </a>
            <a className="project-detail-back" href="/book-call" onClick={() => setMobileNavOpen(false)}>
              Book Call
            </a>
            <a className="project-detail-back" href="/" onClick={() => setMobileNavOpen(false)}>
              Back to Portfolio
            </a>
          </div>
        </header>

        <section className="project-detail-wrap">
          <p className="project-detail-kicker">Project</p>
          <h1>Project Not Found</h1>
          <p>The project you are trying to view does not exist.</p>
        </section>
      </main>
    );
  }

  const projectPhotos = Array.isArray(project.photos) ? project.photos : [];
  const githubLink = project.github || '#';
  const liveDemoLink = project.liveDemo || project.link || '#';

  return (
    <main className="project-detail-page">
      <header className="project-detail-nav">
        <a className="project-detail-logo" href="/">A.B</a>
        <div className="project-detail-nav-actions">
          <a className="project-detail-back" href="/projects">Back to Projects</a>
          <a className="project-detail-back" href="/guestbook">Guestbook</a>
        </div>
        <button
          className={`project-detail-hamburger ${mobileNavOpen ? 'open' : ''}`}
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileNavOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`project-detail-mobile-menu ${mobileNavOpen ? 'open' : ''}`}>
          <a className="project-detail-back" href="/projects" onClick={() => setMobileNavOpen(false)}>
            Projects
          </a>
          <a className="project-detail-back" href="/guestbook" onClick={() => setMobileNavOpen(false)}>
            Guestbook
          </a>
          <a className="project-detail-back" href="/book-call" onClick={() => setMobileNavOpen(false)}>
            Book Call
          </a>
          <a className="project-detail-back" href="/" onClick={() => setMobileNavOpen(false)}>
            Back to Portfolio
          </a>
        </div>
      </header>

      <section className="project-detail-wrap">
        <p className="project-detail-kicker">Project Detail</p>
        <h1>{project.title}</h1>
        <p className="project-detail-period">{project.period}</p>

        <section className="project-detail-section">
          <h2>Tech Stack</h2>
          <div className="project-detail-stack">
            {(project.stack || []).map((tech) => {
              const icon = stackIconMap[tech];
              return (
                <span key={tech} className="project-detail-stack-item">
                  {icon ? (
                    <span className="project-detail-stack-logo-wrap" aria-hidden="true">
                      <img className="project-detail-stack-logo" src={icon} alt="" loading="lazy" />
                    </span>
                  ) : null}
                  <span>{tech}</span>
                </span>
              );
            })}
          </div>
        </section>

        <section className="project-detail-section">
          <h2>About The Project</h2>
          <p>{project.about || project.summary}</p>
        </section>

        <section className="project-detail-section">
          <h2>Photos</h2>
          {projectPhotos.length > 0 ? (
            <div className="project-detail-photos">
              {projectPhotos.map((photo, index) => (
                <figure key={photo} className="project-photo-card">
                  <img src={photo} alt={`${project.title} screenshot ${index + 1}`} loading="lazy" />
                </figure>
              ))}
            </div>
          ) : (
            <p>No project photos available yet.</p>
          )}
        </section>

        <section className="project-detail-section project-detail-actions">
          <a
            className="project-detail-cta project-detail-cta-github"
            href={githubLink}
            target={githubLink !== '#' ? '_blank' : undefined}
            rel={githubLink !== '#' ? 'noopener noreferrer' : undefined}
          >
            <span className="github-logo-wrap" aria-hidden="true">
              <img
                className="github-logo-original"
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                alt=""
                loading="lazy"
              />
            </span>
            GitHub Repo
          </a>
          <a
            className="project-detail-cta"
            href={liveDemoLink}
            target={liveDemoLink !== '#' ? '_blank' : undefined}
            rel={liveDemoLink !== '#' ? 'noopener noreferrer' : undefined}
          >
            Live Demo
          </a>
        </section>
      </section>
    </main>
  );
}

export default ProjectDetailPage;
