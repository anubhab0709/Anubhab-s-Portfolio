import SectionHeader from '../components/common/SectionHeader';
import { education } from '../data/portfolioData';

function Education() {
  return (
    <section id="education" className="section">
      <SectionHeader label="Academics" title="Education" accent="Path" />
      <div className="education-grid">
        {education.map((item) => (
          <article key={`${item.degree}-${item.period}`} className="education-card reveal">
            <p className="timeline-date">{item.period}</p>
            <h3>{item.degree}</h3>
            <h4>{item.institute}</h4>
            <p>{item.score}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Education;
