import { useState, useEffect, useMemo } from 'react';
import { slugifyForAnchors } from '../../utils/kbUtils';
import './TableOfContents.css';

export default function TableOfContents({ content = '' }) {
  // Extract all H2 headings from content
  const headings = useMemo(() => {
    if (!content) return [];
    const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const fullText = match[1].replace(/<[^>]*>/g, '').trim();
      if (fullText) {
        // Strip leading numbers like "1. " for clean anchor title if desired or keep
        const id = slugifyForAnchors(fullText);
        matches.push({ id, text: fullText });
      }
    }
    return matches;
  }, [content]);

  const [activeId, setActiveId] = useState(headings[0]?.id || '');

  // Intersection observer or scroll spy to highlight active heading
  useEffect(() => {
    if (!headings.length) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      let current = headings[0]?.id || '';

      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.offsetTop <= scrollPosition) {
          current = h.id;
        }
      }
      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (!headings.length) return null;

  const scrollToHeading = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <div className="kb-toc-card">
      <h3 className="kb-toc-card__title">In this article</h3>
      <nav aria-label="Table of contents">
        <ul className="kb-toc-list">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <li key={h.id} className="kb-toc-item">
                <a
                  href={`#${h.id}`}
                  className={`kb-toc-link ${isActive ? 'kb-toc-link--active' : ''}`}
                  onClick={(e) => scrollToHeading(e, h.id)}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

