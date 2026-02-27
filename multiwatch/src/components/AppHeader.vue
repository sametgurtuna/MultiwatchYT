<template>
  <header class="app-header" role="banner">
    <div class="app-header__inner">

      <!-- Logo -->
      <div class="app-header__brand">
        <span class="app-header__logo" aria-hidden="true">▶▶</span>
        <span class="app-header__title">Multiwatch</span>
      </div>

      <!-- URL Input Form -->
      <form class="app-header__form" @submit.prevent="handleAdd" novalidate>
        <div class="input-wrapper" :class="{ 'input-wrapper--error': errorMsg, 'input-wrapper--shake': shaking }">
          <input
            ref="inputEl"
            v-model="urlInput"
            type="url"
            class="url-input"
            placeholder="YouTube, Twitch or Kick URL..."
            aria-label="Video URL"
            autocomplete="off"
            spellcheck="false"
            @input="clearError"
            @animationend="shaking = false"
          />
          <span v-if="errorMsg" class="input-error" role="alert">{{ errorMsg }}</span>
        </div>
        <button type="submit" class="btn btn-primary add-btn" :disabled="!urlInput.trim()">
          <span aria-hidden="true">+</span> Add
        </button>
      </form>

      <!-- Right Controls -->
      <div class="app-header__controls">

        <!-- Layout Picker -->
        <div class="layout-picker" role="group" aria-label="Layout presets">
          <button
            v-for="preset in layoutPresets"
            :key="preset.id"
            class="btn-icon layout-btn"
            :class="{ 'layout-btn--active': currentLayout === preset.id }"
            :title="preset.label"
            :aria-label="preset.label"
            :aria-pressed="currentLayout === preset.id"
            @click="setLayout(preset.id)"
          >
            <span class="layout-icon" v-html="preset.icon" />
          </button>
        </div>

        <div class="divider" aria-hidden="true" />

        <!-- Share Button -->
        <button
          class="btn btn-ghost share-btn"
          title="Copy shareable link"
          aria-label="Copy shareable link"
          @click="$emit('share')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span class="share-btn__label">Share</span>
        </button>

        <!-- Clear All -->
        <button
          v-if="videoCount > 0"
          class="btn-icon"
          title="Remove all videos"
          aria-label="Remove all videos"
          @click="$emit('clearAll')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>

        <!-- Theme Toggle -->
        <button
          class="btn-icon theme-btn"
          :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
          @click="toggleTheme"
        >
          <!-- Sun -->
          <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- Moon -->
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>

    </div>

    <!-- Performance warning -->
    <Transition name="fade">
      <div v-if="videoCount >= 6" class="perf-warning" role="status">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Performance may degrade with {{ videoCount }} simultaneous streams. Consider removing some videos.
      </div>
    </Transition>

  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useEmbedFactory } from '../composables/useEmbedFactory.js';
import { useTheme } from '../composables/useTheme.js';
import { useVideosStore } from '../stores/videos.js';
import { storeToRefs } from 'pinia';

const emit = defineEmits(['share', 'clearAll']);

const store = useVideosStore();
const { layout: currentLayout, videos } = storeToRefs(store);
const { setLayout } = store;

const { theme, toggleTheme } = useTheme();
const { parseUrl } = useEmbedFactory();

const urlInput  = ref('');
const errorMsg  = ref('');
const shaking   = ref(false);
const inputEl   = ref(null);

const videoCount = computed(() => videos.value.length);

const layoutPresets = [
  {
    id: 'auto',
    label: 'Auto layout',
    icon: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>`,
  },
  {
    id: 'focus',
    label: 'Focus (1 large + sidebar)',
    icon: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="10" height="14" rx="1"/><rect x="13" y="1" width="2" height="6" rx="0.5"/><rect x="13" y="9" width="2" height="6" rx="0.5"/></svg>`,
  },
  {
    id: 'rows',
    label: 'Stacked rows',
    icon: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="14" height="4" rx="1"/><rect x="1" y="6" width="14" height="4" rx="1"/><rect x="1" y="11" width="14" height="4" rx="1"/></svg>`,
  },
  {
    id: 'cols',
    label: 'Side by side columns',
    icon: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="4" height="14" rx="1"/><rect x="6" y="1" width="4" height="14" rx="1"/><rect x="11" y="1" width="4" height="14" rx="1"/></svg>`,
  },
];

function clearError() {
  errorMsg.value = '';
}

function handleAdd() {
  const raw = urlInput.value.trim();
  if (!raw) return;

  const parsed = parseUrl(raw);
  if (!parsed) {
    errorMsg.value = 'Unsupported URL. Paste a YouTube, Twitch, or Kick link.';
    shaking.value = true;
    inputEl.value?.focus();
    return;
  }

  store.addVideo(parsed);
  urlInput.value = '';
  errorMsg.value = '';
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: background-color var(--transition);
}

.app-header__inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: var(--header-height);
  max-width: 100%;
}

/* Brand */
.app-header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.app-header__logo {
  font-size: 1.1rem;
  color: var(--accent);
}
.app-header__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

/* Form */
.app-header__form {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.input-wrapper {
  flex: 1;
  min-width: 0;
  position: relative;
}

.url-input {
  width: 100%;
  padding: 9px 14px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  transition: border-color var(--transition), background-color var(--transition);
  outline: none;
}
.url-input::placeholder { color: var(--text-muted); }
.url-input:focus { border-color: var(--border-focus); background: var(--bg); }

.input-wrapper--error .url-input { border-color: var(--danger); }

.input-error {
  position: absolute;
  left: 0;
  top: calc(100% + 4px);
  font-size: 0.75rem;
  color: var(--danger);
  white-space: nowrap;
  pointer-events: none;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.input-wrapper--shake .url-input {
  animation: shake 0.4s ease;
}

.add-btn {
  flex-shrink: 0;
  font-size: 0.875rem;
}

/* Controls */
.app-header__controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  margin: 0 4px;
}

/* Layout picker */
.layout-picker {
  display: flex;
  gap: 2px;
}
.layout-btn {
  opacity: 0.5;
  transition: opacity var(--transition), background-color var(--transition);
}
.layout-btn:hover     { opacity: 0.8; }
.layout-btn--active   { opacity: 1; background-color: var(--accent-dim); color: var(--accent); }

.layout-icon { display: flex; align-items: center; }

/* Share button */
.share-btn .share-btn__label { font-size: 0.8rem; }

/* Perf warning */
.perf-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: rgba(255, 179, 71, 0.12);
  border-top: 1px solid rgba(255, 179, 71, 0.25);
  font-size: 0.78rem;
  color: var(--warning);
}

/* ── Mobile ────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .app-header__inner {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 12px;
    gap: 8px;
  }

  .app-header__brand { order: 1; }
  .app-header__controls { order: 2; margin-left: auto; }
  .app-header__form { order: 3; width: 100%; }

  .layout-picker { display: none; }
  .divider       { display: none; }

  .share-btn .share-btn__label { display: none; }
}
</style>
