import { useMemo } from 'react';
import Avatar from '../../../../components/Avatar/Avatar';
import StatusBadge from '../StatusBadge/StatusBadge';
import { formatDate, readingTime, sanitizeHtml, slugifyForAnchors } from '../../utils/kbUtils';
import './ArticleBody.css';

export default function ArticleBody({ article }) {
  // Process HTML content to inject anchor IDs into H2 headings
  const processedHtml = useMemo(() => {
    if (!article) return '';
    const raw = article.content || '<p>No content available for this article.</p>';
    const sanitized = sanitizeHtml(raw);

    // Replace <h2>...</h2> with <h2 id="slug">...</h2>
    return sanitized.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs, text) => {
      // Check if id already exists
      if (attrs.includes('id=')) return match;
      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      const id = slugifyForAnchors(cleanText);
      return `<h2 id="${id}"${attrs}>${text}</h2>`;
    });
  }, [article]);

  if (!article) return null;

  const authorInitials = (article.author_name || article.author || 'MC')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const estReadTime = readingTime(article.content || '');
  const updatedDate = formatDate(article.updated_at);
  const versionNum = article.published_version || article.version || 1;

  return (
    <div className="kb-article-body-card">
      {/* Author & Version Row */}
      <div className="kb-article-author-row">
        <div className="kb-article-author-row__left">
          <Avatar initials={authorInitials} size="md" />
          <div className="kb-article-author-row__info">
            <span className="kb-article-author-row__name">
              {article.author_name || article.author || 'Support Team'}
            </span>
            <span className="kb-article-author-row__meta">
              Updated {updatedDate} · {estReadTime} min read · Version {versionNum}
            </span>
          </div>
        </div>
        <div className="kb-article-author-row__badge">
          <StatusBadge status={article.status} />
        </div>
      </div>

      {/* Rendered HTML Body */}
      <div
        className="kb-article-content"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    </div>
  );
}
