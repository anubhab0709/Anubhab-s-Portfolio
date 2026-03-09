import { useEffect, useState } from 'react';
import SectionHeader from '../components/common/SectionHeader';
import { experience } from '../data/portfolioData';

function Experience() {
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    if (!selectedCertificate) {
      return undefined;
    }

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setSelectedCertificate(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedCertificate]);

  return (
    <section id="experience" className="section">
      <SectionHeader label="Timeline" title="Professional" accent="Experience" />

      <div className="timeline">
        {experience.map((item) => (
          <article key={`${item.title}-${item.period}`} className="timeline-item reveal">
            <p className="timeline-date">{item.period}</p>
            <div className="experience-title-row">
              <h3>{item.title}</h3>
              {item.certificate ? (
                <button
                  type="button"
                  className="project-view-link experience-cert-view"
                  onClick={() => setSelectedCertificate(item.certificate)}
                >
                  View
                </button>
              ) : null}
            </div>
            <h4>{item.company}</h4>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      {selectedCertificate ? (
        <div className="certificate-modal" role="dialog" aria-modal="true" aria-label="Certificate preview">
          <div className="certificate-modal-panel">
            <button
              type="button"
              className="certificate-close"
              onClick={() => setSelectedCertificate(null)}
            >
              Close
            </button>

            {selectedCertificate.type === 'pdf' ? (
              <iframe
                title={selectedCertificate.title}
                src={selectedCertificate.file}
                className="certificate-frame"
              />
            ) : (
              <img
                src={selectedCertificate.file}
                alt={selectedCertificate.title}
                className="certificate-image"
              />
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Experience;
