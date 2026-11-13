import './SettingsCard.css';

export default function SettingsCard({
  title,
  description,
  headerAction,
  children,
  className = '',
}) {
  return (
    <section className={`settings-card ${className}`.trim()}>
      {(title || description || headerAction) && (
        <div className="settings-card__header">
          <div className="settings-card__titles">
            {title && <h2 className="settings-card__title">{title}</h2>}
            {description && (
              <p className="settings-card__description">{description}</p>
            )}
          </div>
          {headerAction && (
            <div className="settings-card__action">{headerAction}</div>
          )}
        </div>
      )}
      <div className="settings-card__content">{children}</div>
    </section>
  );
}

