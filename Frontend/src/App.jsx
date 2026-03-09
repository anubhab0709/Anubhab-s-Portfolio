import AllProjectsPage from './pages/AllProjectsPage';
import GuestbookPage from './pages/GuestbookPage';
import BookCallPage from './pages/BookCallPage';
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';

function App() {
  const path = window.location.pathname;

  if (path === '/app' || path === '/app/') {
    return <HomePage />;
  }

  if (path === '/projects' || path === '/projects/') {
    return <AllProjectsPage />;
  }

  if (path.startsWith('/projects/')) {
    return <ProjectDetailPage />;
  }

  if (path === '/guestbook' || path === '/guestbook/') {
    return <GuestbookPage />;
  }

  if (path === '/book-call' || path === '/book-call/') {
    return <BookCallPage />;
  }

  if (path === '/legacy' || path === '/legacy/') {
    return (
      <div className="page-shell">
        <iframe
          className="legacy-frame"
          src="/index-original.html"
          title="Anubhab Portfolio"
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <iframe
        className="legacy-frame"
        src="/index-original.html"
        title="Anubhab Portfolio"
      />
    </div>
  );
}

export default App;
