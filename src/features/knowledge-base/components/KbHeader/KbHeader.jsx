import './KbHeader.css';

export default function KbHeader({
  title,
  subtitle,
  actions,
  className = '',
}) {
  return (
    <div className={`kb-header ${className}`.trim()}>
      <div className="kb-header__text">
        <h1 className="kb-header__title">{title}</h1>
        {subtitle && <p className="kb-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="kb-header__actions">{actions}</div>}
    </div>
  );
}

