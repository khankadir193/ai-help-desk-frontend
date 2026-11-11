import SkeletonRegion from './SkeletonRegion';

const CATEGORY_COUNT = 6;

export default function KbCategoryCardsSkeleton({ count = CATEGORY_COUNT }) {
  return (
    <SkeletonRegion label="Loading categories...">
      <div className="kb-category-grid">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="kb-category-card">
            <span
              aria-hidden="true"
              className="kb-category-card__icon kb-skel"
              style={{ borderRadius: '8px' }}
            />
            <span
              aria-hidden="true"
              className="kb-category-card__title kb-skel"
              style={{ width: '62%', height: 20 }}
            />
            <span
              aria-hidden="true"
              className="kb-category-card__description kb-skel"
              style={{ height: 18 }}
            />
            <span
              aria-hidden="true"
              className="kb-category-card__footer kb-skel"
              style={{ width: '46%', height: 13 }}
            />
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}
