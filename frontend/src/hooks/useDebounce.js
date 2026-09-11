import { useEffect, useState } from 'react';

// Delays reflecting a fast-changing value until it stops changing for
// `delay` ms. Used for the product search box so typing doesn't fire
// an API request on every keystroke -- only once the user pauses.
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
};
