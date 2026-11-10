import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav className="kb-breadcrumbs" aria-label="Breadcrumbs">
      <ol className="kb-breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="kb-breadcrumbs__item">
              {item.path && !isLast ? (
                <Link to={item.path} className="kb-breadcrumbs__link">
                  {item.label}
                </Link>
              ) : (
                <span className="kb-breadcrumbs__current" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className="kb-breadcrumbs__separator" aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

