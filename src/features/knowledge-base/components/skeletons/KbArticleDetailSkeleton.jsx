import SkeletonRegion from './SkeletonRegion';
import SkeletonBlock from './SkeletonBlock';
import SkeletonText from './SkeletonText';
import SkeletonCircle from './SkeletonCircle';

const tocLineIndex = [150, 120, 160, 100, 140];
const relatedLineIndex = [140, 110, 130];

export default function KbArticleDetailSkeleton() {
  return (
    <SkeletonRegion label="Loading article...">
      <div className="kb-header">
        <div className="kb-header__text">
          <SkeletonBlock width={420} height={31} style={{ maxWidth: '100%', marginBottom: 4 }} />
          <SkeletonBlock width={300} height={22} style={{ maxWidth: '100%' }} />
        </div>
        <div className="kb-header__actions">
          <SkeletonBlock width={104} height={38} radius={8} />
          <SkeletonBlock width={118} height={38} radius={8} />
        </div>
      </div>

      <div className="kb-detail-grid">
        <div className="kb-detail-grid__left">
          <div className="kb-detail-main-card">
            <div className="kb-article-author-row">
              <div className="kb-article-author-row__left">
                <SkeletonCircle size={32} />
                <div className="kb-article-author-row__info">
                  <SkeletonBlock width={120} height={14} style={{ marginBottom: 4 }} />
                  <SkeletonBlock width={230} height={13} style={{ maxWidth: '100%' }} />
                </div>
              </div>
              <SkeletonBlock width={80} height={22} radius={999} />
            </div>

            <SkeletonText lines={3} lineWidths={['100%', '100%', '96%']} height={25} gap={10} style={{ marginBottom: 16 }} />
            <SkeletonText lines={3} lineWidths={['100%', '100%', '72%']} height={25} gap={10} style={{ marginBottom: 16 }} />
            <SkeletonText lines={2} lineWidths={['100%', '58%']} height={25} gap={10} style={{ marginBottom: 16 }} />
            <SkeletonBlock width={'62%'} height={25} />

            <div className="kb-feedback-section">
              <div className="kb-feedback-section__left">
                <SkeletonBlock width={150} height={16} style={{ marginBottom: 4 }} />
                <SkeletonBlock width={180} height={13} style={{ maxWidth: '100%' }} />
              </div>
              <div className="kb-feedback-section__actions">
                <SkeletonBlock width={58} height={36} radius={8} />
                <SkeletonBlock width={58} height={36} radius={8} />
              </div>
            </div>
          </div>
        </div>

        <div className="kb-detail-grid__right">
          <div className="kb-info-card">
            <SkeletonBlock width={110} height={15} style={{ marginBottom: 16 }} />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="kb-info-card__group">
                <SkeletonBlock width={74} height={12} style={{ marginBottom: 4 }} />
                <SkeletonBlock width={150 + (i % 2) * 20} height={14} style={{ maxWidth: '100%' }} />
              </div>
            ))}
          </div>

          <div className="kb-toc-card">
            <SkeletonBlock width={130} height={15} style={{ marginBottom: 14 }} />
            <div className="kb-toc-list">
              {tocLineIndex.map((width, i) => (
                <SkeletonBlock key={i} width={width} height={13} style={{ maxWidth: '100%' }} />
              ))}
            </div>
          </div>

          <div className="kb-related-card">
            <SkeletonBlock width={120} height={15} style={{ marginBottom: 14 }} />
            <div className="kb-related-list">
              {relatedLineIndex.map((width, i) => (
                <SkeletonBlock key={i} width={width} height={13} style={{ maxWidth: '100%' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}
