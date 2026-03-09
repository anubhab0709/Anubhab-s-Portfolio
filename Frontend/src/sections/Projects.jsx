import { useMemo, useState } from 'react';
import SectionHeader from '../components/common/SectionHeader';
import { usePortfolioContent } from '../context/contentContext';

function Projects() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { projects } = usePortfolioContent();

  const availableFilters = useMemo(() => {
    const dynamicFilters = new Set(['all']);
    projects.forEach((project) => {
      (project.category || []).forEach((item) => dynamicFilters.add(item));
    });
    return Array.from(dynamicFilters);
  }, [projects]);

  const visibleProjects = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter((project) => (project.category || []).includes(activeFilter));
  }, [activeFilter]);

  return (
    <section id="projects" className="section projects-section">
      <SectionHeader label="Selected Work" title="Real" accent="Projects" />

      <div className="filter-row reveal">
        {availableFilters.map((filter) => (
          <button
            key={filter}
            className={activeFilter === filter ? 'active' : ''}
            onClick={() => setActiveFilter(filter)}
          >
            {filter.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="projects-grid">
        {visibleProjects.map((project) => (
          <article key={project.id} className="project-card reveal">
            <p className="project-period">{project.period}</p>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
            <ul>
              {(project.metrics || []).map((metric) => (
                <li key={metric}>{metric}</li>
              ))}
            </ul>
            <a className="project-view-link" href={`/projects/${encodeURIComponent(String(project.id))}`}>
              View Project
            </a>
            <div className="tags">
              {(project.stack || []).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Projects;
