import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const STORAGE_KEY = 'multiwatch_session';

function generateId() {
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* storage unavailable */ }
}

export const useVideosStore = defineStore('videos', () => {
  const saved = loadFromStorage();

  // ── State ──────────────────────────────────────────────────────────────────
  const videos  = ref(saved?.videos  ?? []);
  const layout  = ref(saved?.layout  ?? 'auto');
  const soloId  = ref(null); // ID of the video that has audio unmuted

  // ── Persistence ────────────────────────────────────────────────────────────
  watch(
    [videos, layout],
    () => saveToStorage({ videos: videos.value, layout: layout.value }),
    { deep: true }
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  function addVideo(meta) {
    // meta: { type, sourceId, subtype?, rawUrl, label, color }
    videos.value.push({
      id:       generateId(),
      type:     meta.type,
      sourceId: meta.sourceId,
      subtype:  meta.subtype  ?? null,
      rawUrl:   meta.rawUrl   ?? '',
      label:    meta.label    ?? '',
      color:    meta.color    ?? '#7c5cfc',
      muted:    true,
    });
  }

  function removeVideo(id) {
    videos.value = videos.value.filter((v) => v.id !== id);
    if (soloId.value === id) soloId.value = null;
  }

  function reorderVideos(newList) {
    videos.value = newList;
  }

  function setLayout(l) {
    layout.value = l;
  }

  function soloAudio(id) {
    // Toggle: if already soloed, un-solo (mute all)
    if (soloId.value === id) {
      soloId.value = null;
      videos.value.forEach((v) => { v.muted = true; });
    } else {
      soloId.value = id;
      videos.value.forEach((v) => { v.muted = v.id !== id; });
    }
  }

  function clearAll() {
    videos.value = [];
    soloId.value = null;
  }

  // ── URL State Encoding ─────────────────────────────────────────────────────

  function encodeToUrl() {
    if (!videos.value.length) return window.location.origin + window.location.pathname;
    const parts = videos.value.map((v) => {
      const prefix = v.type === 'youtube' ? 'yt'
                   : v.type === 'twitch'  ? 'tw'
                   : v.type === 'kick'    ? 'ki'
                   : v.type;
      const sub = v.subtype ? `:${v.subtype}` : '';
      return `${prefix}${sub}:${v.sourceId}`;
    });
    const url = new URL(window.location.href);
    url.searchParams.set('v', parts.join(','));
    url.searchParams.set('layout', layout.value);
    return url.toString();
  }

  function loadFromUrl() {
    try {
      const url = new URL(window.location.href);
      const vParam = url.searchParams.get('v');
      if (!vParam) return false;

      const typeMap = { yt: 'youtube', tw: 'twitch', ki: 'kick' };
      const colorMap = { youtube: '#ff0000', twitch: '#9146ff', kick: '#53fc18' };
      const labelMap = { youtube: 'YouTube', twitch: 'Twitch', kick: 'Kick' };

      const items = vParam.split(',').map((part) => {
        // format: yt:ID  or  tw:channel:ID  or  tw:vod:ID
        const segments = part.split(':');
        const prefix   = segments[0];
        const type     = typeMap[prefix] ?? prefix;

        let sourceId, subtype;
        if (type === 'twitch' && segments.length === 3) {
          subtype  = segments[1];
          sourceId = segments[2];
        } else {
          sourceId = segments[1];
          subtype  = null;
        }

        return {
          id:       generateId(),
          type,
          sourceId,
          subtype:  subtype ?? null,
          rawUrl:   '',
          label:    labelMap[type] ?? type,
          color:    colorMap[type] ?? '#7c5cfc',
          muted:    true,
        };
      }).filter((v) => v.sourceId);

      if (!items.length) return false;

      const layoutParam = url.searchParams.get('layout');

      videos.value  = items;
      layout.value  = layoutParam ?? 'auto';
      soloId.value  = null;

      // Clean URL (remove params from address bar without reload)
      const clean = new URL(window.location.href);
      clean.searchParams.delete('v');
      clean.searchParams.delete('layout');
      window.history.replaceState({}, '', clean.toString());

      return true;
    } catch {
      return false;
    }
  }

  return {
    videos, layout, soloId,
    addVideo, removeVideo, reorderVideos,
    setLayout, soloAudio, clearAll,
    encodeToUrl, loadFromUrl,
  };
});
