import { useState } from 'react';
import '../styles/book-call-page.css';

function BookCallPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const bookingUrl = import.meta.env.VITE_CALCOM_BOOKING_URL || 'https://cal.com/anubhab-bhattacharjee-yjlhny';

  return (
    <main className="book-call-page">
      <header className="book-call-nav">
        <a className="book-call-logo" href="/">
          A.B
        </a>
        <div className="book-call-nav-actions">
          <a className="book-call-nav-link" href="/projects">
            Projects
          </a>
          <a className="book-call-nav-link" href="/guestbook">
            Guestbook
          </a>
          <a className="book-call-nav-link" href="/">
            Back to Portfolio
          </a>
        </div>
        <button
          className={`book-call-hamburger ${mobileNavOpen ? 'open' : ''}`}
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileNavOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`book-call-mobile-menu ${mobileNavOpen ? 'open' : ''}`}>
          <a className="book-call-nav-link" href="/projects" onClick={() => setMobileNavOpen(false)}>
            Projects
          </a>
          <a className="book-call-nav-link" href="/guestbook" onClick={() => setMobileNavOpen(false)}>
            Guestbook
          </a>
          <a className="book-call-nav-link" href="/book-call" onClick={() => setMobileNavOpen(false)}>
            Book Call
          </a>
          <a className="book-call-nav-link" href="/" onClick={() => setMobileNavOpen(false)}>
            Back to Portfolio
          </a>
        </div>
      </header>

      <section className="book-call-wrap">
        <p className="book-call-kicker">Let's Connect</p>
        <h1 className="book-call-title">
          Get In <span>Touch</span>
        </h1>
        <p className="book-call-subtext">
          Ready to collaborate on your next project? Let's discuss how we can work together.
        </p>

        <article className="book-call-card">
          <div className="book-call-card-head">
            <div>
              <p className="book-call-label">Book Call</p>
              <h2>Schedule a Call</h2>
            </div>
            <div className="book-slot-row">
              <a className="book-slot-btn" href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <svg className="meet-logo" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                  <path fill="#34A853" d="M33 22.5v3L39 31V17l-6 5.5z" />
                  <path fill="#FBBC04" d="M33 25.5V33c0 1.66-1.34 3-3 3H12c-1.66 0-3-1.34-3-3V15c0-1.66 1.34-3 3-3h1.5l4.5 4.5h12c1.66 0 3 1.34 3 3v3z" />
                  <path fill="#4285F4" d="M33 22.5v3L24 20l9-7.5z" />
                  <path fill="#EA4335" d="M18 16.5 13.5 12H30c1.66 0 3 1.34 3 3v4.5z" />
                </svg>
                Book Your Slot
              </a>
            </div>
          </div>
          <p>
            Let's have a 15-30 minute conversation about your project goals and how I can help bring them to life.
          </p>

          <ul className="book-call-points">
            <li>15-30 minutes</li>
            <li>Google Meet video call</li>
            <li>Flexible timing</li>
          </ul>

          <p className="book-call-note">
            Perfect for project discussions, technical consultations, or just a friendly chat about technology.
          </p>
        </article>
      </section>
    </main>
  );
}

export default BookCallPage;
