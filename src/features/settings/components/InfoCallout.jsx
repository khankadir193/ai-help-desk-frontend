import './InfoCallout.css';

export default function InfoCallout({
  title,
  children,
  className = '',
}) {
  return (
    <div className={`info-callout ${className}`.trim()} role="note">
      {title && <h3 className="info-callout__title">{title}</h3>}
      <div className="info-callout__body">{children}</div>
    </div>
  );
}

