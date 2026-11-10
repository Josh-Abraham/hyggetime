import { useEffect, useState } from 'react';

// Controls show on mouse movement and, in fullscreen, hide again after a pause
export default function useAutoHideControls(isFullscreen, delay = 3000) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timer;
    const show = () => {
      setVisible(true);
      clearTimeout(timer);
      if (isFullscreen) timer = setTimeout(() => setVisible(false), delay);
    };

    show();
    document.addEventListener('mousemove', show);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousemove', show);
    };
  }, [isFullscreen, delay]);

  return visible;
}
