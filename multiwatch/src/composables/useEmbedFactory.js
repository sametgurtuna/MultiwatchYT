/**
 * useEmbedFactory
 * Detects video platform from a URL and produces embed metadata.
 * Adding a new platform = adding one entry to PARSERS.
 */

const DOMAIN = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    // Standard: youtube.com/watch?v=ID
    if (u.searchParams.has('v')) return u.searchParams.get('v');
    // Short: youtu.be/ID
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0];
    // Embed: youtube.com/embed/ID
    if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1].split('/')[0];
    // Live: youtube.com/live/ID
    if (u.pathname.startsWith('/live/')) return u.pathname.split('/live/')[1].split('/')[0];
  } catch {
    // fallback for malformed URLs
    const vParam = url.match(/[?&]v=([^&]+)/);
    if (vParam) return vParam[1];
    const shortUrl = url.match(/youtu\.be\/([^/?&]+)/);
    if (shortUrl) return shortUrl[1];
  }
  return null;
}

function extractTwitchInfo(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    // VOD: twitch.tv/videos/ID
    if (parts[0] === 'videos' && parts[1]) {
      return { subtype: 'vod', id: parts[1] };
    }
    // Clip: twitch.tv/clip/SLUG or twitch.tv/CHANNEL/clip/SLUG
    if (parts[parts.length - 2] === 'clip') {
      return { subtype: 'clip', id: parts[parts.length - 1] };
    }
    // Channel: twitch.tv/CHANNEL
    if (parts[0]) {
      return { subtype: 'channel', id: parts[0] };
    }
  } catch { /* fall through */ }
  return null;
}

function extractKickSlug(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0]) return parts[0];
  } catch { /* fall through */ }
  return null;
}

// ─── Parser Registry ─────────────────────────────────────────────────────────

const PARSERS = [
  {
    name: 'youtube',
    label: 'YouTube',
    color: '#ff0000',
    test: (url) => /youtube\.com|youtu\.be/i.test(url),
    parse(url) {
      const id = extractYouTubeId(url);
      return id ? { type: 'youtube', sourceId: id } : null;
    },
    buildEmbed(sourceId) {
      return `https://www.youtube.com/embed/${sourceId}?autoplay=1&mute=1&rel=0`;
    },
    buildTitle(sourceId) {
      return `YouTube video ${sourceId}`;
    },
  },
  {
    name: 'twitch',
    label: 'Twitch',
    color: '#9146ff',
    test: (url) => /twitch\.tv/i.test(url),
    parse(url) {
      const info = extractTwitchInfo(url);
      if (!info) return null;
      return { type: 'twitch', sourceId: info.id, subtype: info.subtype };
    },
    buildEmbed(sourceId, meta = {}) {
      const parent = DOMAIN || 'localhost';
      if (meta.subtype === 'vod') {
        return `https://player.twitch.tv/?video=${sourceId}&parent=${parent}&autoplay=true&muted=true`;
      }
      if (meta.subtype === 'clip') {
        return `https://clips.twitch.tv/embed?clip=${sourceId}&parent=${parent}&autoplay=true&muted=true`;
      }
      // channel (default)
      return `https://player.twitch.tv/?channel=${sourceId}&parent=${parent}&autoplay=true&muted=true`;
    },
    buildTitle(sourceId) {
      return `Twitch: ${sourceId}`;
    },
  },
  {
    name: 'kick',
    label: 'Kick',
    color: '#53fc18',
    test: (url) => /kick\.com/i.test(url),
    parse(url) {
      const slug = extractKickSlug(url);
      return slug ? { type: 'kick', sourceId: slug } : null;
    },
    buildEmbed(sourceId) {
      return `https://player.kick.com/${sourceId}?autoplay=true&muted=true`;
    },
    buildTitle(sourceId) {
      return `Kick: ${sourceId}`;
    },
  },
];

// ─── Public API ──────────────────────────────────────────────────────────────

export function useEmbedFactory() {
  /**
   * Parse a raw URL into embed metadata.
   * Returns null if no parser matches or parsing fails.
   */
  function parseUrl(rawUrl) {
    const url = rawUrl.trim();
    if (!url) return null;

    for (const parser of PARSERS) {
      if (parser.test(url)) {
        const result = parser.parse(url);
        if (result) {
          return {
            ...result,
            rawUrl: url,
            label: parser.label,
            color: parser.color,
          };
        }
      }
    }
    return null;
  }

  /**
   * Build the iframe src from stored embed data.
   */
  function buildEmbedUrl(video) {
    const parser = PARSERS.find((p) => p.name === video.type);
    if (!parser) return '';
    return parser.buildEmbed(video.sourceId, { subtype: video.subtype });
  }

  /**
   * Get a human-readable title for a video.
   */
  function buildTitle(video) {
    const parser = PARSERS.find((p) => p.name === video.type);
    if (!parser) return video.sourceId;
    return parser.buildTitle(video.sourceId);
  }

  /**
   * Returns the list of supported platform names.
   */
  function getSupportedPlatforms() {
    return PARSERS.map((p) => ({ name: p.name, label: p.label, color: p.color }));
  }

  return { parseUrl, buildEmbedUrl, buildTitle, getSupportedPlatforms };
}
