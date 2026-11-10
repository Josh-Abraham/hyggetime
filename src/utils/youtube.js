const YOUTUBE_URL = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
const VIDEO_ID = /(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/;
const START_TIME = /[?&]t=(\d+)/;

export const isValidYouTubeUrl = (url) => YOUTUBE_URL.test(url);

export const getVideoId = (url) => (url || '').match(VIDEO_ID)?.[1] ?? null;

// Seconds offset from a URL's ?t= / &t= parameter (e.g. "t=42s" or "t=1287")
export const getStartSeconds = (url) => {
  const match = (url || '').match(START_TIME);
  return match ? parseInt(match[1], 10) : 0;
};

// ReactPlayer's `loop` is unreliable for YouTube, so seek back to the start when a video ends
export const restartPlayer = (player, url) => {
  if (player) player.seekTo(getStartSeconds(url), 'seconds');
};

export const getThumbnailUrl = (url) => {
  const id = getVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
};

export const fetchVideoTitle = async (url) => {
  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    return data.title || null;
  } catch (error) {
    console.error('Error fetching YouTube title:', error);
    return null;
  }
};
