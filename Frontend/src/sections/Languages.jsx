import SectionHeader from '../components/common/SectionHeader';
import { languages } from '../data/portfolioData';

function Languages() {
  return (
    <section id="languages" className="section">
      <SectionHeader label="Communication" title="Language" accent="Fluency" />
      <div className="language-grid">
        {languages.map((language) => (
          <article key={language.name} className="language-card reveal">
            <h3>{language.name}</h3>
            <p>{language.level}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Languages;
