import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    
    // Fallback for older browsers like Safari < 14
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // @ts-ignore
      media.addListener(listener);
      // @ts-ignore
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
}
