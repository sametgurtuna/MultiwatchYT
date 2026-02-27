<template>
  <div class="app" :data-theme="theme">
    <AppHeader
      @share="handleShare"
      @clearAll="handleClearAll"
    />
    <VideoGrid />
    <ToastNotification />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import VideoGrid from './components/VideoGrid.vue';
import ToastNotification from './components/ToastNotification.vue';
import { useTheme } from './composables/useTheme.js';
import { useToast } from './composables/useToast.js';
import { useVideosStore } from './stores/videos.js';

const { theme } = useTheme();
const { success, info } = useToast();
const store = useVideosStore();

onMounted(() => {
  // Prefer URL params over localStorage
  const loadedFromUrl = store.loadFromUrl();
  if (loadedFromUrl) {
    info(`Loaded ${store.videos.length} video${store.videos.length === 1 ? '' : 's'} from shared link.`);
  }
});

async function handleShare() {
  if (!store.videos.length) {
    info('Add some videos first before sharing.');
    return;
  }
  const url = store.encodeToUrl();
  try {
    await navigator.clipboard.writeText(url);
    success('Shareable link copied to clipboard!');
  } catch {
    // Fallback for browsers that deny clipboard access
    prompt('Copy this shareable link:', url);
  }
}

function handleClearAll() {
  if (!store.videos.length) return;
  const count = store.videos.length;
  store.clearAll();
  info(`Removed ${count} video${count === 1 ? '' : 's'}.`);
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
</style>
