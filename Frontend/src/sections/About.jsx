import SectionHeader from '../components/common/SectionHeader';
import { personalInfo } from '../data/portfolioData';

function About() {
  return (
    <section id="about" className="section about">
      <SectionHeader label="About" title="Crafting" accent="Purposeful Software" />

      <div className="about-grid">
        <article className="about-copy reveal">
          {personalInfo.about.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </article>

        <div className="about-stats reveal">
          {personalInfo.stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
