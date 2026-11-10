import { useCallback, useState } from 'react';

const STORAGE_KEY = 'hyggetime.unavailable';
// A removed video may come back (or a block may be lifted), so forget it after a week
const TTL = 7 * 24 * 60 * 60 * 1000;

const load = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const now = Date.now();
    return Object.fromEntries(Object.entries(stored).filter(([, at]) => now - at < TTL));
  } catch {
    return {};
  }
};

// Remembers scenes and sounds whose video failed to load so they stop being offered.
// Keys are `scene:<name>` or `sound:<name>`.
export default function useUnavailable() {
  const [unavailable, setUnavailable] = useState(load);

  const markUnavailable = useCallback((key) => {
    setUnavailable((current) => {
      const next = { ...current, [key]: Date.now() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable: the item is still hidden for this session
      }
      return next;
    });
  }, []);

  const isAvailable = useCallback((key) => !(key in unavailable), [unavailable]);

  return { isAvailable, markUnavailable };
}
