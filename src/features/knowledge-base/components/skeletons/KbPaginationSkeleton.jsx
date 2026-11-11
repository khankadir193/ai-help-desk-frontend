import SkeletonRegion from './SkeletonRegion';

export default function KbPaginationSkeleton() {
  return (
    <SkeletonRegion label="Loading pages...">
      <div className="kb-pagination" aria-hidden="true">
        <span className="kb-skel" style={{ width: 190, height: 18 }} />
        <div className="kb-pagination__controls">
          <span className="kb-skel" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <span className="kb-skel" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <span className="kb-skel" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <span className="kb-skel" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <span className="kb-skel" style={{ width: 36, height: 36, borderRadius: 8 }} />
        </div>
      </div>
    </SkeletonRegion>
  );
}
