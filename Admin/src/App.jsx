import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEYS = {
  baseUrl: 'portfolio.admin.baseUrl',
  token: 'portfolio.admin.token'
};

const TABS = {
  projects: 'Projects',
  social: 'Social Links',
  resumes: 'CV / Resume',
  guestbook: 'Guest Messages',
  contacts: 'Contact Inbox'
};

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const emptyProject = () => ({
  id: `project-${Date.now()}`,
  title: '',
  period: '',
  summary: '',
  about: '',
  category: [],
  metrics: [],
  stack: [],
  photos: [],
  github: '',
  liveDemo: '',
  link: ''
});

const emptyLink = () => ({ label: '', href: '' });
const emptyResume = () => ({ label: '', href: '', isPrimary: false });

function splitCsv(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toCsv(list) {
  return Array.isArray(list) ? list.join(', ') : '';
}

function toIsoDate(dateLike) {
  const d = new Date(dateLike);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString();
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const validationDetails = Array.isArray(data?.errors)
      ? data.errors.map((item) => item?.message).filter(Boolean).join(', ')
      : '';
    const message = validationDetails || data?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return data;
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

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function App() {
  const defaultApiBaseUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1', []);
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem(STORAGE_KEYS.baseUrl) || defaultApiBaseUrl);
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEYS.token) || '');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [projects, setProjects] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [resumes, setResumes] = useState([]);

  const [guestbook, setGuestbook] = useState([]);
  const [guestSearch, setGuestSearch] = useState('');
  const [showHidden, setShowHidden] = useState(true);

  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const googleButtonRef = useRef(null);
  const googleClientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || '', []);

  const isAuthed = Boolean(token);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.baseUrl, baseUrl);
  }, [baseUrl]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.token, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.token);
    }
  }, [token]);

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token]);

  async function loadContent() {
    const data = await request(baseUrl, '/admin/content', { headers: authHeaders });
    setProjects(data.data.projects || []);
    setSocialLinks(data.data.socialLinks || []);
    setResumes(data.data.resumes || []);
  }

  async function loadGuestbook() {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', '100');
    params.set('includeHidden', String(showHidden));
    if (guestSearch.trim()) {
      params.set('search', guestSearch.trim());
    }

    const data = await request(baseUrl, `/admin/guestbook?${params.toString()}`, { headers: authHeaders });
    setGuestbook(data.data.items || []);
  }

  async function loadContacts() {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', '100');
    if (contactSearch.trim()) {
      params.set('search', contactSearch.trim());
    }

    const data = await request(baseUrl, `/admin/contacts?${params.toString()}`, { headers: authHeaders });
    setContacts(data.data.items || []);
  }

  async function bootstrapAdmin() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await Promise.all([loadContent(), loadGuestbook(), loadContacts()]);
      setMessage('Admin data loaded');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrapAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (isAuthed || !googleClientId || !googleButtonRef.current) {
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
          callback: async (response) => {
            if (!response?.credential) {
              setError('Google credential missing. Please try again.');
              return;
            }

            setGoogleLoading(true);
            setError('');
            setMessage('');

            try {
              const authData = await request(baseUrl, '/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential })
              });

              const newToken = authData?.data?.token;
              if (!newToken) {
                throw new Error('Token not received from login response');
              }

              await request(baseUrl, '/admin/content', {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                  'Content-Type': 'application/json'
                }
              });

              setToken(newToken);
              setMessage('Google login successful.');
            } catch (err) {
              setToken('');
              setError(err.message || 'Google login failed.');
            } finally {
              setGoogleLoading(false);
            }
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
          setError('Unable to load Google Sign-In.');
        }
      });

    return () => {
      canceled = true;
    };
  }, [baseUrl, googleClientId, isAuthed]);

  async function handleSaveContent() {
    setContentSaving(true);
    setError('');
    setMessage('');

    try {
      const normalizedResumes = resumes.map((resume) => ({ ...resume, isPrimary: Boolean(resume.isPrimary) }));
      await request(baseUrl, '/admin/content', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ projects, socialLinks, resumes: normalizedResumes })
      });
      setMessage('Portfolio content saved successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setContentSaving(false);
    }
  }

  async function toggleGuestVisibility(entryId, isHidden) {
    setError('');
    setMessage('');
    try {
      await request(baseUrl, `/admin/guestbook/${entryId}/visibility`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ isHidden })
      });
      await loadGuestbook();
      setMessage('Guest message updated');
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteGuest(entryId) {
    if (!window.confirm('Delete this guest message permanently?')) {
      return;
    }

    setError('');
    setMessage('');
    try {
      await request(baseUrl, `/admin/guestbook/${entryId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      await loadGuestbook();
      setMessage('Guest message deleted');
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleContactRead(messageId, isRead) {
    setError('');
    setMessage('');
    try {
      await request(baseUrl, `/admin/contacts/${messageId}/read`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ isRead })
      });
      await loadContacts();
      setMessage('Contact status updated');
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteContact(messageId) {
    if (!window.confirm('Delete this contact message permanently?')) {
      return;
    }

    setError('');
    setMessage('');
    try {
      await request(baseUrl, `/admin/contacts/${messageId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      await loadContacts();
      setMessage('Contact message deleted');
    } catch (err) {
      setError(err.message);
    }
  }

  function updateProject(index, field, value) {
    setProjects((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  }

  function updateLink(index, field, value) {
    setSocialLinks((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  }

  function updateResume(index, field, value) {
    setResumes((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  }

  return (
    <div className="app">
      <div className="backdrop" aria-hidden="true" />
      <main className="shell">
        <header className="topbar">
          <div className="topbar-center">
            <h1>Admin Dashboard</h1>
            <p className="eyebrow center">Portfolio Control Room</p>
          </div>
          <div className="topbar-actions">
            {isAuthed ? (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setToken('');
                  setMessage('Logged out');
                  setError('');
                }}
              >
                Logout
              </button>
            ) : null}
          </div>
        </header>

        <section className="panel login-panel">
          <h2>Secure Login</h2>
          <Field label="Backend API Base URL">
            <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} placeholder="http://localhost:8080/api/v1" />
          </Field>

          {!isAuthed ? (
            <div className="auth-grid single">
              <div className="card auth-card">
                <h3>Login with Google</h3>
                <p className="auth-copy">Use your admin Google account. Access is restricted by backend ADMIN_EMAILS.</p>
                {googleClientId ? (
                  <div className="google-login-wrap">
                    <div ref={googleButtonRef} />
                    {googleLoading ? <p className="auth-copy">Signing you in...</p> : null}
                  </div>
                ) : (
                  <p className="notice error">Set `VITE_GOOGLE_CLIENT_ID` in Admin environment to enable Google login.</p>
                )}
              </div>
            </div>
          ) : null}

          {message && <p className="notice success">{message}</p>}
          {error && <p className="notice error">{error}</p>}
        </section>

        {isAuthed && (
          <>
            <section className="tabs">
              {Object.entries(TABS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={activeTab === key ? 'tab active' : 'tab'}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                </button>
              ))}
              <button type="button" className="secondary right" onClick={bootstrapAdmin} disabled={loading}>
                Refresh
              </button>
            </section>

            <section className="panel">
              {(activeTab === 'projects' || activeTab === 'social' || activeTab === 'resumes') && (
                <div className="content-actions">
                  <button type="button" onClick={handleSaveContent} disabled={contentSaving}>
                    {contentSaving ? 'Saving...' : 'Save Portfolio Content'}
                  </button>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="stacked">
                  <div className="content-actions">
                    <button type="button" onClick={() => setProjects((prev) => [...prev, emptyProject()])}>
                      Add Project
                    </button>
                  </div>
                  {projects.map((project, index) => (
                    <article key={project.id || index} className="card project-card">
                      <div className="card-header">
                        <h3>Project {index + 1}</h3>
                        <button type="button" className="danger" onClick={() => setProjects((prev) => prev.filter((_, idx) => idx !== index))}>
                          Delete
                        </button>
                      </div>
                      <div className="grid two-col">
                        <Field label="ID"><input value={project.id} onChange={(e) => updateProject(index, 'id', e.target.value)} /></Field>
                        <Field label="Title"><input value={project.title} onChange={(e) => updateProject(index, 'title', e.target.value)} /></Field>
                        <Field label="Period"><input value={project.period} onChange={(e) => updateProject(index, 'period', e.target.value)} /></Field>
                        <Field label="GitHub URL"><input value={project.github} onChange={(e) => updateProject(index, 'github', e.target.value)} /></Field>
                        <Field label="Live Demo URL"><input value={project.liveDemo} onChange={(e) => updateProject(index, 'liveDemo', e.target.value)} /></Field>
                        <Field label="Project Link URL"><input value={project.link} onChange={(e) => updateProject(index, 'link', e.target.value)} /></Field>
                      </div>
                      <Field label="Summary">
                        <textarea rows={3} value={project.summary} onChange={(e) => updateProject(index, 'summary', e.target.value)} />
                      </Field>
                      <Field label="About">
                        <textarea rows={5} value={project.about} onChange={(e) => updateProject(index, 'about', e.target.value)} />
                      </Field>
                      <div className="grid two-col">
                        <Field label="Category (comma separated)">
                          <input
                            value={toCsv(project.category)}
                            onChange={(e) => updateProject(index, 'category', splitCsv(e.target.value))}
                          />
                        </Field>
                        <Field label="Metrics (comma separated)">
                          <input
                            value={toCsv(project.metrics)}
                            onChange={(e) => updateProject(index, 'metrics', splitCsv(e.target.value))}
                          />
                        </Field>
                        <Field label="Stack (comma separated)">
                          <input
                            value={toCsv(project.stack)}
                            onChange={(e) => updateProject(index, 'stack', splitCsv(e.target.value))}
                          />
                        </Field>
                        <Field label="Photo URLs (comma separated)">
                          <input
                            value={toCsv(project.photos)}
                            onChange={(e) => updateProject(index, 'photos', splitCsv(e.target.value))}
                          />
                        </Field>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {activeTab === 'social' && (
                <div className="stacked">
                  <div className="content-actions">
                    <button type="button" onClick={() => setSocialLinks((prev) => [...prev, emptyLink()])}>
                      Add Social Link
                    </button>
                  </div>
                  {socialLinks.map((link, index) => (
                    <article key={`${link.label}-${index}`} className="card">
                      <div className="card-header">
                        <h3>Link {index + 1}</h3>
                        <button type="button" className="danger" onClick={() => setSocialLinks((prev) => prev.filter((_, idx) => idx !== index))}>
                          Delete
                        </button>
                      </div>
                      <div className="grid two-col">
                        <Field label="Label"><input value={link.label} onChange={(e) => updateLink(index, 'label', e.target.value)} /></Field>
                        <Field label="URL"><input value={link.href} onChange={(e) => updateLink(index, 'href', e.target.value)} /></Field>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {activeTab === 'resumes' && (
                <div className="stacked">
                  <div className="content-actions">
                    <button type="button" onClick={() => setResumes((prev) => [...prev, emptyResume()])}>
                      Add Resume Link
                    </button>
                  </div>
                  {resumes.map((resume, index) => (
                    <article key={`${resume.label}-${index}`} className="card">
                      <div className="card-header">
                        <h3>Resume {index + 1}</h3>
                        <button type="button" className="danger" onClick={() => setResumes((prev) => prev.filter((_, idx) => idx !== index))}>
                          Delete
                        </button>
                      </div>
                      <div className="grid two-col">
                        <Field label="Label"><input value={resume.label} onChange={(e) => updateResume(index, 'label', e.target.value)} /></Field>
                        <Field label="URL"><input value={resume.href} onChange={(e) => updateResume(index, 'href', e.target.value)} /></Field>
                      </div>
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={Boolean(resume.isPrimary)}
                          onChange={(e) =>
                            setResumes((prev) =>
                              prev.map((item, idx) => ({
                                ...item,
                                isPrimary: idx === index ? e.target.checked : false
                              }))
                            )
                          }
                        />
                        Mark as primary resume
                      </label>
                    </article>
                  ))}
                </div>
              )}

              {activeTab === 'guestbook' && (
                <div className="stacked">
                  <div className="toolbar">
                    <input
                      placeholder="Search guest messages"
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                    />
                    <label className="checkbox compact">
                      <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
                      Include hidden
                    </label>
                    <button type="button" onClick={loadGuestbook}>Search</button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Author</th>
                          <th>Message</th>
                          <th>Created</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guestbook.map((entry) => (
                          <tr key={entry._id}>
                            <td>
                              <strong>{entry.authorName}</strong>
                              <small>{entry.authorEmail}</small>
                            </td>
                            <td>{entry.message}</td>
                            <td>{toIsoDate(entry.createdAt)}</td>
                            <td>{entry.isHidden ? 'Hidden' : 'Visible'}</td>
                            <td className="actions-cell">
                              <button type="button" onClick={() => toggleGuestVisibility(entry._id, !entry.isHidden)}>
                                {entry.isHidden ? 'Unhide' : 'Hide'}
                              </button>
                              <button type="button" className="danger" onClick={() => deleteGuest(entry._id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="stacked">
                  <div className="toolbar">
                    <input
                      placeholder="Search contact messages"
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                    />
                    <button type="button" onClick={loadContacts}>Search</button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Sender</th>
                          <th>Subject</th>
                          <th>Message</th>
                          <th>Created</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact) => (
                          <tr key={contact._id}>
                            <td>
                              <strong>{contact.name}</strong>
                              <small>{contact.email}</small>
                            </td>
                            <td>{contact.subject}</td>
                            <td>{contact.message}</td>
                            <td>{toIsoDate(contact.createdAt)}</td>
                            <td>{contact.isRead ? 'Read' : 'Unread'}</td>
                            <td className="actions-cell">
                              <button type="button" onClick={() => toggleContactRead(contact._id, !contact.isRead)}>
                                {contact.isRead ? 'Mark Unread' : 'Mark Read'}
                              </button>
                              <button type="button" className="danger" onClick={() => deleteContact(contact._id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
