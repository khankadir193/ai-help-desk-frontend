import { forwardRef } from 'react';
import './skeletons.css';

const SkeletonBlock = forwardRef(function SkeletonBlock(
  { width = '100%', height = 16, radius, className = '', style, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`kb-skel ${className}`.trim()}
      style={{
        width,
        height,
        ...(radius !== undefined ? { borderRadius: radius } : null),
        ...style,
      }}
      {...rest}
    />
  );
});

export default SkeletonBlock;
