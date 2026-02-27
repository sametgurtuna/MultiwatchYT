<template>
  <div
    class="video-panel"
    :class="[`video-panel--${video.type}`, { 'video-panel--soloed': isSoloed, 'video-panel--muted': video.muted && hasSolo }]"
    :style="panelStyle"
    role="region"
    :aria-label="`${video.label} video panel`"
  >
    <!-- Resize handle (top-left drag for sortable) -->
    <div class="video-panel__drag-handle" title="Drag to reorder">
      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <circle cx="7" cy="4" r="1.5"/><circle cx="13" cy="4" r="1.5"/>
        <circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/>
        <circle cx="7" cy="16" r="1.5"/><circle cx="13" cy="16" r="1.5"/>
      </svg>
    </div>

    <!-- Platform badge -->
    <div class="video-panel__badge" :style="{ '--platform-color': video.color }">
      {{ video.label }}
    </div>

    <!-- Iframe -->
    <div class="video-panel__embed">
      <iframe
        :key="iframeKey"
        :src="embedUrl"
        :title="`${video.label}: ${video.sourceId}`"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        allowfullscreen
        class="video-panel__iframe"
        loading="lazy"
      />
    </div>

    <!-- Controls overlay (shown on hover) -->
    <div class="video-panel__controls" aria-label="Video controls">
      <!-- Solo Audio -->
      <button
        class="panel-btn"
        :class="{ 'panel-btn--active': isSoloed }"
        :title="isSoloed ? 'Remove audio solo' : 'Solo audio (mute others)'"
        :aria-label="isSoloed ? 'Remove audio solo' : 'Solo audio (mute others)'"
        @click="$emit('solo', video.id)"
      >
        <svg v-if="!video.muted || isSoloed" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
      </button>

      <!-- Reload -->
      <button
        class="panel-btn"
        title="Reload video"
        aria-label="Reload video"
        @click="reload"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      </button>

      <!-- Close -->
      <button
        class="panel-btn panel-btn--danger"
        title="Remove video"
        aria-label="Remove video"
        @click="$emit('remove', video.id)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Muted overlay indicator -->
    <Transition name="fade">
      <div v-if="video.muted && hasSolo && !isSoloed" class="video-panel__muted-overlay" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
        <span>Muted</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useEmbedFactory } from '../composables/useEmbedFactory.js';

const props = defineProps({
  video:   { type: Object, required: true },
  isSoloed:{ type: Boolean, default: false },
  hasSolo: { type: Boolean, default: false },
  width:   { type: String,  default: null },
  height:  { type: String,  default: null },
});

defineEmits(['remove', 'solo']);

const { buildEmbedUrl } = useEmbedFactory();

const iframeKey = ref(0);

const embedUrl = computed(() => buildEmbedUrl(props.video));

const panelStyle = computed(() => {
  const s = {};
  if (props.width)  s.width  = props.width;
  if (props.height) s.height = props.height;
  return s;
});

function reload() {
  iframeKey.value++;
}
</script>

<style scoped>
.video-panel {
  position: relative;
  background: var(--panel-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  transition: box-shadow var(--transition), border-color var(--transition), opacity var(--transition);
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.video-panel:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--surface-hover);
}

.video-panel--soloed {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-dim), var(--shadow-md);
}

.video-panel--muted {
  opacity: 0.65;
}

/* Drag handle */
.video-panel__drag-handle {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 5;
  color: rgba(255,255,255,0.45);
  cursor: grab;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: color var(--transition), background-color var(--transition);
  opacity: 0;
}
.video-panel:hover .video-panel__drag-handle {
  opacity: 1;
}
.video-panel__drag-handle:hover {
  color: rgba(255,255,255,0.9);
  background: rgba(0,0,0,0.4);
}
.video-panel__drag-handle:active { cursor: grabbing; }

/* Platform badge */
.video-panel__badge {
  position: absolute;
  top: 8px;
  left: 32px;
  z-index: 5;
  background: rgba(0,0,0,0.6);
  color: var(--platform-color, #fff);
  font-size: 0.68rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 99px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0;
  transition: opacity var(--transition);
  pointer-events: none;
}
.video-panel:hover .video-panel__badge {
  opacity: 1;
}

/* Embed */
.video-panel__embed {
  flex: 1;
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
}

.video-panel__iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* Controls (shown on hover) */
.video-panel__controls {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--transition);
}
.video-panel:hover .video-panel__controls {
  opacity: 1;
}

.panel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-md);
  background: rgba(0,0,0,0.65);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
  backdrop-filter: blur(4px);
}
.panel-btn:hover { background: rgba(0,0,0,0.85); color: #fff; }

.panel-btn--active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}
.panel-btn--active:hover {
  background: rgba(124,92,252,0.3);
}

.panel-btn--danger:hover { background: rgba(255,85,85,0.7); color: #fff; }

/* Muted overlay */
.video-panel__muted-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(0,0,0,0.45);
  color: rgba(255,255,255,0.7);
  font-size: 0.75rem;
  font-weight: 500;
  pointer-events: none;
  z-index: 4;
}

/* ── Mobile: always show controls ───────────────────────────────────────── */
@media (max-width: 768px) {
  .video-panel__controls { opacity: 1; }
  .video-panel__badge    { opacity: 1; }
  .video-panel__drag-handle { display: none; }
}
</style>
