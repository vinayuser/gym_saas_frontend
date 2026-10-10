import { useEffect, useState } from 'react';

const useDebouncedValue = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(typeof value === 'string' ? value.trim() : value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(typeof value === 'string' ? value.trim() : value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebouncedValue;
