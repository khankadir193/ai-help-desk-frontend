import './RoleHeaderCell.css';

export default function RoleHeaderCell({ title, subtitle }) {
  return (
    <div className="role-header-cell">
      <span className="role-header-cell__title">{title}</span>
      {subtitle && <span className="role-header-cell__subtitle">{subtitle}</span>}
    </div>
  );
}
