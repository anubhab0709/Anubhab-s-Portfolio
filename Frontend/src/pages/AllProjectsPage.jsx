import { useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolioContent } from '../context/contentContext';
import '../styles/all-projects-page.css';

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

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GUEST_MESSAGES_KEY = 'portfolio_guest_messages_v1';

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function loadStoredMessages() {
  try {
    const raw = localStorage.getItem(GUEST_MESSAGES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(messages));
}

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google script failed to load')), {
        once: true
      });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google script failed to load'));
    document.head.appendChild(script);
  });
}

function AllProjectsPage() {
  const { projects } = usePortfolioContent();
  const googleButtonRef = useRef(null);
  const [guestUser, setGuestUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [authError, setAuthError] = useState('');
  const [submitState, setSubmitState] = useState('idle');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const googleClientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || '', []);

  useEffect(() => {
    setMessages(loadStoredMessages());
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return undefined;
    }

    let canceled = false;

    loadGoogleScript()
      .then(() => {
        if (canceled || !window.google?.accounts?.id || !googleButtonRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            const payload = decodeJwtPayload(response.credential || '');
            if (!payload?.email) {
              setAuthError('Google login failed. Please try again.');
              return;
            }

            setGuestUser({
              name: payload.name || payload.email,
              email: payload.email,
              picture: payload.picture || ''
            });
            setAuthError('');
          }
        });

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left'
        });
      })
      .catch(() => {
        if (!canceled) {
          setAuthError('Unable to load Google Sign-In right now.');
        }
      });

    return () => {
      canceled = true;
    };
  }, [googleClientId]);

  const handleSubmitGuestMessage = (event) => {
    event.preventDefault();
    if (!guestUser || !messageText.trim()) {
      return;
    }

    const nextMessages = [
      {
        id: Date.now(),
        author: guestUser.name,
        email: guestUser.email,
        text: messageText.trim(),
        createdAt: new Date().toISOString()
      },
      ...messages
    ].slice(0, 10);

    saveMessages(nextMessages);
    setMessages(nextMessages);
    setMessageText('');
    setSubmitState('sent');
  };

  const handleSignOut = () => {
    setGuestUser(null);
    setSubmitState('idle');
    setMessageText('');
    setAuthError('');
  };

  return (
    <main className="all-projects-page">
      <header className="projects-nav">
        <a className="projects-nav-logo" href="/">A.B</a>
        <div className="projects-nav-actions">
          <a className="projects-nav-back" href="/book-call">Book Call</a>
          <a className="projects-nav-back" href="/guestbook">Guestbook</a>
          <a className="projects-nav-back" href="/">Back to Portfolio</a>
        </div>
        <button
          className={`projects-hamburger ${mobileNavOpen ? 'open' : ''}`}
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileNavOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`projects-mobile-menu ${mobileNavOpen ? 'open' : ''}`}>
          <a className="projects-nav-back" href="/projects" onClick={() => setMobileNavOpen(false)}>
            Projects
          </a>
          <a className="projects-nav-back" href="/guestbook" onClick={() => setMobileNavOpen(false)}>
            Guestbook
          </a>
          <a className="projects-nav-back" href="/book-call" onClick={() => setMobileNavOpen(false)}>
            Book Call
          </a>
          <a className="projects-nav-back" href="/" onClick={() => setMobileNavOpen(false)}>
            Back to Portfolio
          </a>
        </div>
      </header>

      <div className="projects-wrap">
        <div className="projects-head">
          <p className="projects-kicker">Portfolio</p>
          <h1>
            All <em>Projects</em>
          </h1>
          <p className="projects-subtext">A complete list of my projects, shown one by one.</p>
        </div>

        <div className="projects-list">
          {projects.map((project, index) => (
            <article key={project.id} className="project-row">
              <div className="project-row-index">{String(index + 1).padStart(2, '0')}</div>
              <div className="project-row-body">
                <div className="project-row-meta">{project.period}</div>
                <h2>{project.title}</h2>
                <p>{project.summary}</p>
                <ul className="project-metrics">
                  {(project.metrics || []).map((metric) => (
                    <li key={metric}>{metric}</li>
                  ))}
                </ul>

                <div className="project-row-links">
                  <a
                    className="project-live-link"
                    href={project.liveDemo || project.link || '#'}
                    target={project.liveDemo && project.liveDemo !== '#' ? '_blank' : undefined}
                    rel={project.liveDemo && project.liveDemo !== '#' ? 'noopener noreferrer' : undefined}
                  >
                    Live Demo Coming Soon (Deployment in process)
                  </a>
                  <a className="project-detail-link" href={`/projects/${encodeURIComponent(String(project.id))}`}>
                    View In Detail
                  </a>
                </div>

                <div className="project-stack-icons" aria-label="Project stack logos">
                  {(project.stack || []).map((tech) => {
                    const icon = stackIconMap[tech];
                    if (!icon) {
                      return (
                        <span key={tech} className="project-stack-fallback" title={tech}>
                          {tech.slice(0, 2).toUpperCase()}
                        </span>
                      );
                    }
                    const invert = tech === 'Express.js' || tech === 'Django';
                    return (
                      <span key={tech} className="project-stack-icon" title={tech}>
                        <img className={invert ? 'logo-invert' : ''} src={icon} alt={tech} loading="lazy" />
                      </span>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="guest-message-section" id="guest-message">
          <div className="guest-message-head">
            <p className="projects-kicker">Connect</p>
            <h2>Guest Message</h2>
            <p className="guest-message-subtext">Leave your message on the dedicated Guestbook page.</p>
          </div>

          <div className="guest-message-panel">
            <a className="projects-nav-back" href="/guestbook">Go To Guestbook</a>
          </div>

          {messages.length > 0 ? (
            <div className="guest-message-list">
              <h3>Recent Guest Messages</h3>
              {messages.slice(0, 3).map((item) => (
                <article key={item.id} className="guest-message-item">
                  <p>{item.text}</p>
                  <footer>
                    <span>{item.author}</span>
                    <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString()}</time>
                  </footer>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default AllProjectsPage;
