/** Where a video plays from. */
export type VideoProvider = 'youtube' | 'vimeo' | 'file';

export interface VideoSource {
  provider: VideoProvider;
  /** The player URL to load on play, for YouTube and Vimeo; the file URL for a file. */
  url: string;
}

const YOUTUBE_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
];

const VIMEO_HOSTS = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];

/** A YouTube time such as `90`, `90s` or `1m30s`, in whole seconds. */
function seconds(time: string | null): number {
  if (!time) return 0;
  if (/^\d+$/.test(time)) return Number(time);
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(time);
  if (!match) return 0;
  const [, h = '0', m = '0', s = '0'] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

function youtubeId(url: URL): string | undefined {
  if (url.hostname === 'youtu.be') return url.pathname.split('/')[1];
  if (!YOUTUBE_HOSTS.includes(url.hostname)) return undefined;
  if (url.pathname === '/watch') return url.searchParams.get('v') ?? undefined;
  const [, kind, id] = url.pathname.split('/');
  return ['embed', 'shorts', 'live', 'v'].includes(kind) ? id : undefined;
}

/**
 * Reads a video URL. YouTube links play through youtube-nocookie.com and Vimeo links with
 * `dnt=1`, so neither sets tracking cookies; any other URL is treated as a video file.
 */
export function parseVideoSource(src: string): VideoSource {
  let url: URL;
  try {
    url = new URL(src, document.baseURI);
  } catch {
    return { provider: 'file', url: src };
  }

  const youtube = youtubeId(url);
  if (youtube && /^[\w-]+$/.test(youtube)) {
    const params = new URLSearchParams({ autoplay: '1', rel: '0' });
    const start = seconds(
      url.searchParams.get('t') ?? url.searchParams.get('start'),
    );
    if (start) params.set('start', String(start));
    return {
      provider: 'youtube',
      url: `https://www.youtube-nocookie.com/embed/${youtube}?${params}`,
    };
  }

  if (VIMEO_HOSTS.includes(url.hostname)) {
    const parts = url.pathname.split('/').filter(Boolean);
    const at = parts[0] === 'video' ? 1 : 0;
    const id = parts[at];
    if (id && /^\d+$/.test(id)) {
      const params = new URLSearchParams({ autoplay: '1', dnt: '1' });
      const hash = url.searchParams.get('h') ?? parts[at + 1];
      if (hash && /^\w+$/.test(hash)) params.set('h', hash);
      return {
        provider: 'vimeo',
        url: `https://player.vimeo.com/video/${id}?${params}`,
      };
    }
  }

  return { provider: 'file', url: src };
}
