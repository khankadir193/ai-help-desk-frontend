import { NavLink, useLocation } from 'react-router-dom';
import './KbTabs.css';

const TABS = [
  { id: 'overview', label: 'Overview', path: '/knowledge-base' },
  { id: 'articles', label: 'All articles', path: '/knowledge-base/articles' },
  { id: 'categories', label: 'Categories', path: '/knowledge-base/categories' },
];

export default function KbTabs() {
  const location = useLocation();

  return (
    <nav className="kb-tabs" aria-label="Knowledge Base navigation">
      <ul className="kb-tabs__list" role="tablist">
        {TABS.map((tab) => {
          // Exact matching for /knowledge-base, prefix for subpaths
          const isOverview = tab.path === '/knowledge-base';
          const isActive = isOverview
            ? location.pathname === '/knowledge-base' || location.pathname === '/knowledge-base/'
            : location.pathname.startsWith(tab.path);

          return (
            <li key={tab.id} className="kb-tabs__item" role="presentation">
              <NavLink
                to={tab.path}
                role="tab"
                aria-selected={isActive}
                className={`kb-tabs__link ${isActive ? 'kb-tabs__link--active' : ''}`}
              >
                {tab.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

