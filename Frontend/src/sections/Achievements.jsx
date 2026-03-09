import SectionHeader from '../components/common/SectionHeader';
import { achievements } from '../data/portfolioData';

function Achievements() {
  return (
    <section id="achievements" className="section">
      <SectionHeader label="Highlights" title="Key" accent="Achievements" />
      <div className="achievement-list">
        {achievements.map((item) => (
          <article key={item} className="achievement-card reveal">
            <p>{item}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Achievements;
