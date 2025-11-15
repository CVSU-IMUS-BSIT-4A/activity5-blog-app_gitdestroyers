import { useEffect, useRef } from 'react';

interface UseClickOutsideReturn {
  ref: React.RefObject<HTMLDivElement>;
}

/**
 * Hook to handle clicking outside of a referenced element
 * Useful for closing dropdowns, modals, or other UI elements when clicking outside
 */
export function useClickOutside(onClickOutside: () => void): UseClickOutsideReturn {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClickOutside]);

  return { ref };
}


