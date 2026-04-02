import { Analytics } from '@vercel/analytics/react';
import AllProjectsPage from './pages/AllProjectsPage';
import GuestbookPage from './pages/GuestbookPage';
import BookCallPage from './pages/BookCallPage';
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';

function App() {
  const path = window.location.pathname;

  if (path === '/app' || path === '/app/') {
    return (
      <>
        <HomePage />
        <Analytics />
      </>
    );
  }

  if (path === '/projects' || path === '/projects/') {
    return (
      <>
        <AllProjectsPage />
        <Analytics />
      </>
    );
  }

  if (path.startsWith('/projects/')) {
    return (
      <>
        <ProjectDetailPage />
        <Analytics />
      </>
    );
  }

  if (path === '/guestbook' || path === '/guestbook/') {
    return (
      <>
        <GuestbookPage />
        <Analytics />
      </>
    );
  }

  if (path === '/book-call' || path === '/book-call/') {
    return (
      <>
        <BookCallPage />
        <Analytics />
      </>
    );
  }

  if (path === '/legacy' || path === '/legacy/') {
    return (
      <>
        <div className="page-shell">
          <iframe
            className="legacy-frame"
            src="/index-original.html"
            title="Anubhab Portfolio"
          />
        </div>
        <Analytics />
      </>
    );
  }

  return (
    <>
      <div className="page-shell">
        <iframe
          className="legacy-frame"
          src="/index-original.html"
          title="Anubhab Portfolio"
        />
      </div>
      <Analytics />
    </>
  );
}

export default App;
