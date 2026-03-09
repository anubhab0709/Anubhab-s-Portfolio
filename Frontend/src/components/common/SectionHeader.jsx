function SectionHeader({ label, title, accent }) {
  return (
    <header className="section-header reveal">
      <p className="section-label">{label}</p>
      <h2>
        {title} <em>{accent}</em>
      </h2>
    </header>
  );
}

export default SectionHeader;
