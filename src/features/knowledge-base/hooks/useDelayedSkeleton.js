import { useEffect, useRef, useState } from 'react';

const DEFAULT_DELAY = 150;
const DEFAULT_MIN_DISPLAY = 300;

export function useDelayedSkeleton(isLoading, options = {}) {
  const { delay = DEFAULT_DELAY, minDuration = DEFAULT_MIN_DISPLAY } = options;
  const [show, setShow] = useState(false);
  const shownAtRef = useRef(0);

  useEffect(() => {
    if (!isLoading) return undefined;

    const timer = setTimeout(() => {
      shownAtRef.current = Date.now();
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  useEffect(() => {
    if (!show || isLoading) return undefined;

    const remaining = Math.max(0, shownAtRef.current + minDuration - Date.now());
    const timer = setTimeout(() => setShow(false), remaining);

    return () => clearTimeout(timer);
  }, [show, isLoading, minDuration]);

  return show;
}

export default useDelayedSkeleton;
