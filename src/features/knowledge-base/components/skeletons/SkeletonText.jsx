import SkeletonBlock from './SkeletonBlock';

export default function SkeletonText({
  lines = 3,
  lineWidths,
  height = 13,
  gap = 8,
  className = '',
  style,
  ...rest
}) {
  const widths = Array.isArray(lineWidths)
    ? lineWidths
    : Array(lines).fill('100%');

  return (
    <div
      className={`kb-skel-text ${className}`.trim()}
      style={{ gap, ...style }}
      {...rest}
    >
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBlock
          key={i}
          height={height}
          width={widths[i] ?? widths[widths.length - 1]}
        />
      ))}
    </div>
  );
}
