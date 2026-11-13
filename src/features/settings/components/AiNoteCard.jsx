import './AiNoteCard.css';

export default function AiNoteCard({
  title,
  children,
  className = '',
}) {
  return (
    <div className={`ai-note-card ${className}`.trim()} role="note">
      {title && <h3 className="ai-note-card__title">{title}</h3>}
      <div className="ai-note-card__body">{children}</div>
    </div>
  );
}

