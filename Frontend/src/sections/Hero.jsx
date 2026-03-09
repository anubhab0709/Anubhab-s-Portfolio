import { personalInfo } from '../data/portfolioData';

function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-overlay" />
      <div className="hero-content reveal visible">
        <p className="hero-tag">Available for Work</p>
        <h1>
          {personalInfo.name.split(' ')[0]} <em>{personalInfo.name.split(' ').slice(1).join(' ')}</em>
        </h1>
        <p>{personalInfo.headline}</p>
        <div className="hero-actions">
          <a href="#projects" className="button button-primary">
            View Projects
          </a>
          <a href="#contact" className="button button-secondary">
            Contact Me
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
