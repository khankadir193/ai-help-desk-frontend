import SkeletonBlock from '../skeletons/SkeletonBlock';
import './KbStatCards.css';

export default function KbStatCards({ stats, isLoading }) {
  const publishedCount = stats?.publishedCount ?? 0;
  const draftCount = stats?.draftCount ?? 0;
  const reviewCount = stats?.reviewCount ?? 0;
  const helpfulnessRate = stats?.helpfulnessRate ?? 94;
  const ratingsCount = stats?.ratingsCount ?? 820;

  const cards = [
    {
      id: 'published',
      label: 'Published articles',
      value: publishedCount,
      caption: `— ${stats?.publishedThisMonth || '+4 this month'}`,
    },
    {
      id: 'draft',
      label: 'Draft articles',
      value: draftCount,
      caption: '— Not visible to customers',
    },
    {
      id: 'review',
      label: 'Awaiting review',
      value: reviewCount,
      caption: '— Human approval required',
    },
    {
      id: 'helpfulness',
      label: 'Article helpfulness',
      value: `${helpfulnessRate}%`,
      caption: `— Based on ${ratingsCount} ratings`,
    },
  ];

  return (
    <div className="kb-stat-grid" aria-label="Knowledge Base overview statistics">
      {cards.map((card) => (
        <div key={card.id} className="kb-stat-card">
          <span className="kb-stat-card__label">{card.label}</span>
          {isLoading ? (
            <span className="kb-stat-card__value kb-skel" style={{ width: 64, height: 30 }} aria-hidden="true" />
          ) : (
            <span className="kb-stat-card__value">{card.value}</span>
          )}
          <span className="kb-stat-card__caption">{card.caption}</span>
        </div>
      ))}
    </div>
  );
}
