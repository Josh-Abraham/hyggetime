import { useEffect, useState } from 'react';

// Keeps the last effect mounted while it fades out, so choosing "None" (or changing scene)
// dissolves the weather instead of cutting it. Fade-in is a CSS animation on mount.
export default function useFadedEffect(effect, fadeMs = 1500) {
  const [held, setHeld] = useState(effect);

  useEffect(() => {
    if (effect) {
      setHeld(effect);
      return undefined;
    }
    const timer = setTimeout(() => setHeld(null), fadeMs);
    return () => clearTimeout(timer);
  }, [effect, fadeMs]);

  return { current: effect || held, visible: !!effect };
}
