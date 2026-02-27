<template>
  <main
    class="video-grid"
    :class="`video-grid--${layout}`"
    role="main"
    aria-label="Video grid"
  >
    <!-- Empty state -->
    <Transition name="fade">
      <EmptyState v-if="!videos.length" />
    </Transition>

    <!-- Draggable video list -->
    <draggable
      v-if="videos.length"
      v-model="videosList"
      item-key="id"
      class="video-grid__draggable"
      :class="`video-grid__draggable--${layout}`"
      handle=".video-panel__drag-handle"
      animation="200"
      ghost-class="video-panel--ghost"
      chosen-class="video-panel--chosen"
      drag-class="video-panel--dragging"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <VideoPanel
          :video="element"
          :is-soloed="soloId === element.id"
          :has-solo="soloId !== null"
          @remove="store.removeVideo"
          @solo="store.soloAudio"
        />
      </template>
    </draggable>

    <!-- Mobile swipe hint -->
    <Transition name="fade">
      <div v-if="videos.length && isMobile" class="swipe-hint" aria-hidden="true">
        Scroll to see all videos
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { computed } from 'vue';
import draggable from 'vuedraggable';
import { storeToRefs } from 'pinia';
import { useVideosStore } from '../stores/videos.js';
import VideoPanel from './VideoPanel.vue';
import EmptyState from './EmptyState.vue';

const store = useVideosStore();
const { videos, layout, soloId } = storeToRefs(store);

// Two-way computed for draggable v-model
const videosList = computed({
  get:  () => videos.value,
  set:  (val) => store.reorderVideos(val),
});

function onDragEnd() {
  // reorderVideos already called via v-model set
}

const isMobile = computed(() =>
  typeof window !== 'undefined' && window.innerWidth < 768
);
</script>

<style scoped>
.video-grid {
  flex: 1;
  min-height: 0;
  padding: 12px;
  overflow-y: auto;
}

/* ── Draggable container base ──────────────────────────────────────────── */
.video-grid__draggable {
  display: grid;
  gap: 12px;
  width: 100%;
}

/* ── Layout: AUTO (default) ─────────────────────────────────────────────── */
.video-grid__draggable--auto {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr));
}

/* ── Layout: FOCUS (1 big + sidebar) ───────────────────────────────────── */
.video-grid__draggable--focus {
  grid-template-columns: 1fr 280px;
  grid-template-rows: auto;
}
.video-grid__draggable--focus > :first-child {
  grid-row: 1 / span 3;
}

/* ── Layout: ROWS (stacked full width) ─────────────────────────────────── */
.video-grid__draggable--rows {
  grid-template-columns: 1fr;
  max-width: 900px;
  margin: 0 auto;
}

/* ── Layout: COLS (side-by-side columns) ───────────────────────────────── */
.video-grid__draggable--cols {
  grid-template-columns: repeat(3, 1fr);
}

/* ── Drag states ────────────────────────────────────────────────────────── */
:deep(.video-panel--ghost) {
  opacity: 0.4;
  border: 2px dashed var(--accent) !important;
  background: var(--accent-dim) !important;
}
:deep(.video-panel--chosen) {
  box-shadow: var(--shadow-lg), 0 0 0 2px var(--accent) !important;
}
:deep(.video-panel--dragging) {
  cursor: grabbing !important;
  box-shadow: var(--shadow-lg) !important;
  transform: rotate(1.5deg) scale(1.02);
  z-index: 99;
}

/* ── Mobile ─────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .video-grid {
    padding: 8px;
  }
  .video-grid__draggable--auto,
  .video-grid__draggable--focus,
  .video-grid__draggable--cols {
    grid-template-columns: 1fr;
  }
  .video-grid__draggable--focus > :first-child {
    grid-row: auto;
  }
}

/* ── Swipe hint ─────────────────────────────────────────────────────────── */
.swipe-hint {
  text-align: center;
  padding: 8px;
  font-size: 0.75rem;
  color: var(--text-muted);
  display: none;
}
@media (max-width: 768px) {
  .swipe-hint { display: block; }
}
</style>
