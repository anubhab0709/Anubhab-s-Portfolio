import SectionHeader from '../components/common/SectionHeader';
import { skills } from '../data/portfolioData';

function Skills() {
  return (
    <section id="skills" className="section">
      <SectionHeader label="Expertise" title="What I" accent="Do Best" />

      <div className="skills-grid">
        {skills.map((skill) => (
          <article key={skill.title} className="skill-card reveal">
            <h3>{skill.title}</h3>
            <p>{skill.description}</p>
            <div className="tags">
              {skill.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Skills;
