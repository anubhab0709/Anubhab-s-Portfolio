import { personalInfo } from '../../data/portfolioData';

function Footer() {
  return (
    <footer className="site-footer">
      <p>{personalInfo.name}</p>
      <span>Built with React and Vite for production deployment.</span>
    </footer>
  );
}

export default Footer;
