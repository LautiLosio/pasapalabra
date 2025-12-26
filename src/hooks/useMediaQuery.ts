'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // Always start with false to avoid SSR hydration mismatch
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    // Sync with actual value on mount
    setMatches(mediaQuery.matches);
    
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

