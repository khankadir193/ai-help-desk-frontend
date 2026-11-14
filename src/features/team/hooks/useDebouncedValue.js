import { useState, useEffect } from 'react';

/**
 * Debounce a fast-changing value (e.g. a search input) by `delay` ms so the
 * members list is not refetched on every keystroke.
 */
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebouncedValue;
