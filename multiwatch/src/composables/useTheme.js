import { ref, watchEffect } from 'vue';

const STORAGE_KEY = 'multiwatch_theme';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getSavedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

// Singleton so theme is shared across components
const theme = ref(getSavedTheme() || getSystemTheme());

export function useTheme() {
  // Apply theme to <html> element
  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.value);
    try {
      localStorage.setItem(STORAGE_KEY, theme.value);
    } catch { /* storage unavailable */ }
  });

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }

  function setTheme(t) {
    theme.value = t;
  }

  return { theme, toggleTheme, setTheme };
}
