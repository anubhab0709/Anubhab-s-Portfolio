import { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/guestbook-page.css';

const GUESTBOOK_AUTH_TOKEN_KEY = 'portfolio_guestbook_auth_token_v1';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

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

function clearGoogleArtifacts() {
  const picker = document.getElementById('credential_picker_container');
  if (picker) {
    picker.remove();
  }

  document
    .querySelectorAll('iframe[src*="accounts.google.com/gsi"], div[id^="gsi_"]')
    .forEach((node) => {
      if (node instanceof HTMLElement) {
        node.remove();
      }
    });
}

function getInitials(nameOrEmail = '') {
  const source = String(nameOrEmail || '').trim();
  if (!source) return '?';

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function resolveAvatarUrl(userLike) {
  if (!userLike || typeof userLike !== 'object') {
    return '';
  }

  return String(
    userLike.avatarUrl || userLike.authorAvatarUrl || userLike.picture || userLike.imageUrl || userLike.photoURL || ''
  ).trim();
}

function getMessageAvatarUrl(message, currentUser) {
  const fromMessage = resolveAvatarUrl(message);
  if (fromMessage) {
    return fromMessage;
  }

  const messageEmail = String(message?.authorEmail || '').toLowerCase();
  const currentUserEmail = String(currentUser?.email || '').toLowerCase();

  if (messageEmail && currentUserEmail && messageEmail === currentUserEmail) {
    return resolveAvatarUrl(currentUser);
  }

  return '';
}

function decodeJwtPayload(token = '') {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

function decodeGoogleCredential(credential = '') {
  return decodeJwtPayload(credential) || {};
}

function GuestbookPage() {
  const googleButtonRef = useRef(null);
  const [googleUser, setGoogleUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('idle');
  const [authMessage, setAuthMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [messageSuccess, setMessageSuccess] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [devLogin, setDevLogin] = useState({ name: '', email: '' });
  const [editingEntryId, setEditingEntryId] = useState('');
  const [editingText, setEditingText] = useState('');
  const [actionBusyId, setActionBusyId] = useState('');
  const [hideGoogleButton, setHideGoogleButton] = useState(false);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [failedAvatarMap, setFailedAvatarMap] = useState({});

  const googleClientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || '', []);
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1', []);
  const currentUserAvatarUrl = resolveAvatarUrl(googleUser);

  const isAvatarBroken = (url) => Boolean(url && failedAvatarMap[url]);

  const markAvatarBroken = (url) => {
    if (!url) return;
    setFailedAvatarMap((prev) => {
      if (prev[url]) return prev;
      return {
        ...prev,
        [url]: true
      };
    });
  };

  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    setMessageError('');

    try {
      const response = await fetch(`${apiBaseUrl}/guestbook?limit=20&page=1`);
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Failed to load messages');
      }

      setMessages(payload.data.items || []);
    } catch (error) {
      setMessageError(error.message || 'Unable to load guestbook messages right now.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [apiBaseUrl]);

  useEffect(() => {
    const rawToken = sessionStorage.getItem(GUESTBOOK_AUTH_TOKEN_KEY);
    if (!rawToken) {
      return;
    }

    try {
      const storedUser = JSON.parse(sessionStorage.getItem('portfolio_guestbook_user_v1') || '{}');
      const tokenPayload = decodeJwtPayload(rawToken) || {};
      const payload = {
        ...storedUser,
        email: storedUser.email || tokenPayload.email || '',
        name: storedUser.name || tokenPayload.name || '',
        avatarUrl: resolveAvatarUrl(storedUser) || resolveAvatarUrl(tokenPayload)
      };

      if (payload?.email) {
        setGoogleUser({
          ...payload,
          avatarUrl: resolveAvatarUrl(payload)
        });
      }
    } catch {
      sessionStorage.removeItem(GUESTBOOK_AUTH_TOKEN_KEY);
      sessionStorage.removeItem('portfolio_guestbook_user_v1');
    }
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current || googleUser || hideGoogleButton) {
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
      }
      return undefined;
    }

    let canceled = false;
    setAuthStatus('loading');

    loadGoogleScript()
      .then(() => {
        if (canceled || !window.google?.accounts?.id || !googleButtonRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            try {
              const googleClaims = decodeGoogleCredential(response.credential || '');
              const authResponse = await fetch(`${apiBaseUrl}/auth/google`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ credential: response.credential || '' })
              });

              const authPayload = await authResponse.json();

              if (!authResponse.ok || !authPayload?.success || !authPayload?.data?.token) {
                throw new Error(authPayload?.message || 'Google login failed. Please try again.');
              }

              const nextUser = {
                ...authPayload.data.user,
                avatarUrl: resolveAvatarUrl(authPayload.data.user) || resolveAvatarUrl(googleClaims)
              };
              setHideGoogleButton(true);
              if (googleButtonRef.current) {
                googleButtonRef.current.innerHTML = '';
                googleButtonRef.current.style.display = 'none';
              }
              if (window.google?.accounts?.id?.cancel) {
                window.google.accounts.id.cancel();
              }
              if (window.google?.accounts?.id?.disableAutoSelect) {
                window.google.accounts.id.disableAutoSelect();
              }
              clearGoogleArtifacts();
              setGoogleUser(nextUser);
              setShowManualLogin(false);
              sessionStorage.setItem(GUESTBOOK_AUTH_TOKEN_KEY, authPayload.data.token);
              sessionStorage.setItem('portfolio_guestbook_user_v1', JSON.stringify(nextUser));
              setAuthStatus('success');
              setAuthMessage('Logged in with Google.');
            } catch (error) {
              setAuthStatus('error');
              setAuthMessage(error.message || 'Google login failed. Please try again.');
            }
          }
        });

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'left'
        });

        setAuthStatus('idle');
      })
      .catch(() => {
        if (!canceled) {
          setAuthStatus('error');
          setAuthMessage('Unable to load Google Sign-In right now.');
        }
      });

    return () => {
      canceled = true;
    };
  }, [googleClientId, googleUser, hideGoogleButton, apiBaseUrl]);

  const handleSubmitMessage = async (event) => {
    event.preventDefault();
    if (!googleUser || !messageText.trim()) {
      return;
    }

    try {
      const token = sessionStorage.getItem(GUESTBOOK_AUTH_TOKEN_KEY);
      if (!token) {
        throw new Error('Please login again to post your message.');
      }

      const response = await fetch(`${apiBaseUrl}/guestbook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText.trim() })
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Failed to post message');
      }

      setMessages((prev) => [payload.data, ...prev].slice(0, 20));
      setMessageText('');
      setMessageError('');
      setMessageSuccess('Saved to database.');
      await fetchMessages();
    } catch (error) {
      setMessageError(error.message || 'Unable to post message right now.');
      setMessageSuccess('');
    }
  };

  const handleDevLogin = async (event) => {
    event.preventDefault();
    setAuthMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/auth/dev-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: devLogin.name.trim(),
          email: devLogin.email.trim()
        })
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success || !payload?.data?.token) {
        throw new Error(payload?.message || 'Unable to login right now.');
      }

      const nextUser = {
        ...payload.data.user,
        avatarUrl: resolveAvatarUrl(payload.data.user)
      };
      setGoogleUser(nextUser);
      setShowManualLogin(false);
      sessionStorage.setItem(GUESTBOOK_AUTH_TOKEN_KEY, payload.data.token);
      sessionStorage.setItem('portfolio_guestbook_user_v1', JSON.stringify(nextUser));
      setAuthMessage('Logged in successfully.');
    } catch (error) {
      setAuthMessage(error.message || 'Unable to login right now.');
    }
  };

  const handleLogout = () => {
    setGoogleUser(null);
    setHideGoogleButton(false);
    setShowManualLogin(false);
    sessionStorage.removeItem(GUESTBOOK_AUTH_TOKEN_KEY);
    sessionStorage.removeItem('portfolio_guestbook_user_v1');
    if (window.google?.accounts?.id?.disableAutoSelect) {
      window.google.accounts.id.disableAutoSelect();
    }
    if (window.google?.accounts?.id?.cancel) {
      window.google.accounts.id.cancel();
    }
    clearGoogleArtifacts();
    if (googleButtonRef.current) {
      googleButtonRef.current.style.display = '';
      googleButtonRef.current.innerHTML = '';
    }
    setAuthStatus('idle');
    setAuthMessage('');
    setMessageText('');
    setMessageSuccess('');
  };

  const handleGoogleLoginClick = () => {
    if (!googleClientId) {
      setAuthMessage('Google OAuth is not configured yet. Use manual login for now.');
      return;
    }

    const googleButton = googleButtonRef.current?.querySelector('div[role="button"]');
    if (googleButton instanceof HTMLElement) {
      googleButton.click();
      return;
    }

    setAuthMessage('Google Sign-In is loading. Please click again in a moment.');
  };

  const startEditing = (message) => {
    setEditingEntryId(message._id);
    setEditingText(message.message);
    setMessageError('');
    setMessageSuccess('');
  };

  const cancelEditing = () => {
    setEditingEntryId('');
    setEditingText('');
  };

  const handleSaveEdit = async (entryId) => {
    try {
      const token = sessionStorage.getItem(GUESTBOOK_AUTH_TOKEN_KEY);
      if (!token) {
        throw new Error('Please login again to edit your message.');
      }

      setActionBusyId(entryId);
      const response = await fetch(`${apiBaseUrl}/guestbook/${entryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: editingText.trim() })
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Failed to update message');
      }

      setMessages((prev) => prev.map((item) => (item._id === entryId ? payload.data : item)));
      setMessageSuccess('Message updated.');
      setMessageError('');
      cancelEditing();
    } catch (error) {
      setMessageError(error.message || 'Unable to edit message right now.');
      setMessageSuccess('');
    } finally {
      setActionBusyId('');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const token = sessionStorage.getItem(GUESTBOOK_AUTH_TOKEN_KEY);
      if (!token) {
        throw new Error('Please login again to delete your message.');
      }

      setActionBusyId(entryId);
      const response = await fetch(`${apiBaseUrl}/guestbook/${entryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Failed to delete message');
      }

      setMessages((prev) => prev.filter((item) => item._id !== entryId));
      setMessageSuccess('Message deleted.');
      setMessageError('');

      if (editingEntryId === entryId) {
        cancelEditing();
      }
    } catch (error) {
      setMessageError(error.message || 'Unable to delete message right now.');
      setMessageSuccess('');
    } finally {
      setActionBusyId('');
    }
  };

  return (
    <main className="guestbook-page">
      <header className="guestbook-nav">
        <a className="guestbook-logo" href="/">
          A.B
        </a>
        <div className="guestbook-nav-actions">
          <a className="guestbook-nav-link" href="/book-call">
            Book Call
          </a>
          <a className="guestbook-nav-link" href="/projects">
            Projects
          </a>
          <a className="guestbook-nav-link" href="/">
            Back to Portfolio
          </a>
        </div>
        <button
          className={`guestbook-hamburger ${mobileNavOpen ? 'open' : ''}`}
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileNavOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`guestbook-mobile-menu ${mobileNavOpen ? 'open' : ''}`}>
          <a className="guestbook-nav-link" href="/projects" onClick={() => setMobileNavOpen(false)}>
            Projects
          </a>
          <a className="guestbook-nav-link" href="/guestbook" onClick={() => setMobileNavOpen(false)}>
            Guestbook
          </a>
          <a className="guestbook-nav-link" href="/book-call" onClick={() => setMobileNavOpen(false)}>
            Book Call
          </a>
          <a className="guestbook-nav-link" href="/" onClick={() => setMobileNavOpen(false)}>
            Back to Portfolio
          </a>
        </div>
      </header>

      <section className="guestbook-wrap">
        <p className="guestbook-tagline">Guestbook</p>
        <h1>You can tell me anything here!</h1>

        <article className="guestbook-pinned">
          <span className="pinned-chip">Pinned</span>
          <p>
            Hey there! Thanks for visiting my website. If you have a moment, I'd love to hear your thoughts on my
            work. Please log in with your Google account to leave a comment. Thanks!
          </p>
        </article>

        <div className="guestbook-auth-row">
          {googleUser ? (
            <div className="guestbook-user-chip">
              <div className="guestbook-avatar-circle" aria-hidden="true">
                {currentUserAvatarUrl && !isAvatarBroken(currentUserAvatarUrl) ? (
                  <img
                    src={currentUserAvatarUrl}
                    alt={googleUser.email}
                    loading="lazy"
                    onError={() => markAvatarBroken(currentUserAvatarUrl)}
                  />
                ) : (
                  <span>{getInitials(googleUser.name || googleUser.email)}</span>
                )}
              </div>
              <div>
                <strong>{googleUser.name}</strong>
                <span>{googleUser.email}</span>
              </div>
              <button type="button" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : (
            <>
              <div className="guestbook-auth-split">
                <button type="button" className="guestbook-auth-option google" onClick={handleGoogleLoginClick}>
                  <span className="google-mark" aria-hidden="true">
                    <svg viewBox="0 0 48 48" className="google-mark-logo" focusable="false">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.72 1.22 9.22 3.62l6.89-6.9C35.93 2.42 30.35 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.03 6.23C12.44 13.62 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.14-3.08-.4-4.55H24v9.02h12.94c-.56 2.98-2.24 5.5-4.78 7.2l7.73 5.99C44.39 38.05 46.98 31.9 46.98 24.55z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.59 28.55A14.5 14.5 0 0 1 9.5 24c0-1.58.39-3.07 1.09-4.55l-8.03-6.23A23.86 23.86 0 0 0 0 24c0 3.84.92 7.48 2.56 10.78l8.03-6.23z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.73-5.99c-2.15 1.45-4.9 2.28-8.17 2.28-6.26 0-11.56-4.12-13.41-9.95l-8.03 6.23C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                  </span>
                  <span>Sign in with Google</span>
                </button>
                <button
                  type="button"
                  className={`guestbook-auth-option manual ${showManualLogin ? 'active' : ''}`}
                  onClick={() => setShowManualLogin((prev) => !prev)}
                >
                  Login Manually
                </button>
              </div>

              {showManualLogin ? (
                <form className="guestbook-dev-login" onSubmit={handleDevLogin}>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={devLogin.name}
                    onChange={(event) => setDevLogin((prev) => ({ ...prev, name: event.target.value }))}
                    minLength={2}
                    maxLength={120}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={devLogin.email}
                    onChange={(event) => setDevLogin((prev) => ({ ...prev, email: event.target.value }))}
                    maxLength={254}
                    required
                  />
                  <button type="submit">Continue</button>
                </form>
              ) : null}

              {!googleClientId ? (
                <p className="guestbook-auth-note">Google OAuth is not configured. Use manual login.</p>
              ) : null}

              <div className="google-signin-slot-hidden" ref={googleButtonRef} aria-hidden="true" />
            </>
          )}
        </div>

        {authStatus === 'loading' ? <p className="guestbook-auth-note">Loading Google OAuth...</p> : null}
        {authMessage ? <p className="guestbook-auth-note">{authMessage}</p> : null}
        {messageError ? <p className="guestbook-auth-note">{messageError}</p> : null}
        {messageSuccess ? <p className="guestbook-auth-note" style={{ color: '#8ecf7f' }}>{messageSuccess}</p> : null}

        <form className="guestbook-form" onSubmit={handleSubmitMessage}>
          <label htmlFor="guestbookMessage">Message</label>
          <textarea
            id="guestbookMessage"
            placeholder="Write your message here..."
            maxLength={500}
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            disabled={!googleUser}
            required
          />
          <div className="guestbook-form-actions">
            <span>{messageText.length}/500</span>
            <button type="submit" disabled={!googleUser}>
              Post Message
            </button>
          </div>
        </form>

        {isLoadingMessages ? <p className="guestbook-auth-note">Loading messages...</p> : null}

        {messages.length > 0 ? (
          <div className="guestbook-message-list">
            {messages.map((message) => {
              const messageAvatarUrl = getMessageAvatarUrl(message, googleUser);

              return (
                <article key={message._id} className="guestbook-message-item">
                  <div className="guestbook-message-head">
                    <div className="guestbook-avatar-circle" aria-hidden="true">
                      {messageAvatarUrl && !isAvatarBroken(messageAvatarUrl) ? (
                        <img
                          src={messageAvatarUrl}
                          alt={message.authorEmail}
                          loading="lazy"
                          onError={() => markAvatarBroken(messageAvatarUrl)}
                        />
                      ) : (
                        <span>{getInitials(message.authorName || message.authorEmail)}</span>
                      )}
                    </div>
                    <div>
                      <span>
                        {message.authorName} ({message.authorEmail})
                      </span>
                    </div>
                  </div>
                  {editingEntryId === message._id ? (
                    <textarea
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      maxLength={500}
                      rows={4}
                    />
                  ) : (
                    <p>{message.message}</p>
                  )}
                  <footer>
                    <div>
                      <span>Guest Message</span>
                    </div>
                    <div className="guestbook-footer-right">
                      <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleDateString()}</time>
                      {googleUser?.email?.toLowerCase() === message.authorEmail?.toLowerCase() ? (
                        <div className="guestbook-message-actions">
                          {editingEntryId === message._id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(message._id)}
                                disabled={actionBusyId === message._id || !editingText.trim()}
                              >
                                Save
                              </button>
                              <button type="button" onClick={cancelEditing} disabled={actionBusyId === message._id}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => startEditing(message)} disabled={actionBusyId === message._id}>
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(message._id)}
                                disabled={actionBusyId === message._id}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default GuestbookPage;
