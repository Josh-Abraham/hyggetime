import { useCallback, useState } from 'react';

const STORAGE_KEY = 'hyggetime.mixes';

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

// Mixes the user saved, kept in this browser's localStorage
export default function useSavedMixes() {
  const [mixes, setMixes] = useState(load);

  const persist = useCallback((next) => {
    setMixes(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode, quota): the mix still works for this session
    }
  }, []);

  const saveMix = useCallback((mix) => {
    persist([{ ...mix, id: `saved-${Date.now()}` }, ...mixes]);
  }, [mixes, persist]);

  const deleteMix = useCallback((id) => {
    persist(mixes.filter((m) => m.id !== id));
  }, [mixes, persist]);

  return { mixes, saveMix, deleteMix };
}
