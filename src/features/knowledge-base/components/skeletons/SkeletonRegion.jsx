export default function SkeletonRegion({ label = 'Loading content...', className = '', style, children }) {
  return (
    <div role="status" aria-busy="true" className={className} style={style}>
      <span className="kb-sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
