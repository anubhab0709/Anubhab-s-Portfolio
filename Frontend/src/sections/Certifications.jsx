import SectionHeader from '../components/common/SectionHeader';
import { certifications } from '../data/portfolioData';

function Certifications() {
  return (
    <section id="certifications" className="section">
      <SectionHeader label="Credentials" title="Professional" accent="Certifications" />
      <div className="cert-grid">
        {certifications.map((item) => (
          <article key={item} className="cert-card reveal">
            <p>{item}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Certifications;
