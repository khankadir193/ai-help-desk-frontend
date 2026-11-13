import './SettingRow.css';

export default function SettingRow({
  title,
  description,
  action,
  children,
  className = '',
}) {
  return (
    <div className={`setting-row ${className}`.trim()}>
      <div className="setting-row__info">
        {title && <h3 className="setting-row__title">{title}</h3>}
        {description && <div className="setting-row__description">{description}</div>}
        {children}
      </div>
      {action && <div className="setting-row__action">{action}</div>}
    </div>
  );
}

