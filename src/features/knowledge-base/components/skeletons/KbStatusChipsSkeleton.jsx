import SkeletonRegion from './SkeletonRegion';

const CHIP_WIDTHS = [104, 96, 74, 90, 92];

export default function KbStatusChipsSkeleton({ count = CHIP_WIDTHS.length }) {
  return (
    <SkeletonRegion label="Loading filters...">
      <div className="kb-status-chips" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className="kb-status-chip kb-skel"
            style={{ width: CHIP_WIDTHS[i % CHIP_WIDTHS.length] }}
          />
        ))}
      </div>
    </SkeletonRegion>
  );
}
