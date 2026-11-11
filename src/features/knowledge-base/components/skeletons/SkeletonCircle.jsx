import './skeletons.css';

export default function SkeletonCircle({ size = 32, className = '', style, ...rest }) {
  return (
    <span
      aria-hidden="true"
      className={`kb-skel ${className}`.trim()}
      style={{
        width: size,
        height: size,
        borderRadius: '999px',
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    />
  );
}
