import { useEffect, useRef, useState } from 'react';

const STEP_MS = 100;

// Eases a player's volume in when it starts or resumes and out when it pauses, instead of cutting.
// Returns the volume and playing values to hand to the player: pausing is delayed until the fade ends.
export default function useFadedVolume(volume, playing, duration = 900) {
  const [level, setLevel] = useState(0);
  const [active, setActive] = useState(playing);
  const levelRef = useRef(0);

  useEffect(() => {
    if (playing) setActive(true);

    const target = playing ? 1 : 0;
    const steps = Math.max(1, Math.round(duration / STEP_MS));
    const delta = (target - levelRef.current) / steps;
    if (delta === 0) {
      if (!playing) setActive(false);
      return undefined;
    }

    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      levelRef.current = count >= steps ? target : levelRef.current + delta;
      setLevel(levelRef.current);
      if (count >= steps) {
        clearInterval(timer);
        if (!playing) setActive(false);
      }
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [playing, duration]);

  return { volume: volume * level, playing: active };
}
