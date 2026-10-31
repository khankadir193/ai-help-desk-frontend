import './PlaceholderPage.css';

export default function PlaceholderPage({ title, description }) {
  return (
    <main className="placeholder-page">
      <div className="placeholder-card">
        <h2 className="placeholder-card__title">{title}</h2>
        <p className="placeholder-card__text">
          {description || "This section is under active development. Coming soon."}
        </p>
        <span className="placeholder-card__badge">Coming soon</span>
      </div>
    </main>
  );
}

