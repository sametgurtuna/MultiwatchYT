<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast" tag="div" class="toast-stack">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          role="alert"
          @click="dismiss(toast.id)"
        >
          <span class="toast__icon">{{ icons[toast.type] }}</span>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close btn-icon" :aria-label="`Dismiss: ${toast.message}`">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast.js';

const { toasts, dismiss } = useToast();

const icons = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: var(--z-toast);
  pointer-events: none;
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  max-width: 360px;
  min-width: 220px;
  pointer-events: all;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.toast--success { border-left: 3px solid var(--success); }
.toast--error   { border-left: 3px solid var(--danger); }
.toast--warning { border-left: 3px solid var(--warning); }
.toast--info    { border-left: 3px solid var(--accent); }

.toast__icon {
  font-style: normal;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}
.toast--success .toast__icon { color: var(--success); }
.toast--error   .toast__icon { color: var(--danger); }
.toast--warning .toast__icon { color: var(--warning); }
.toast--info    .toast__icon { color: var(--accent); }

.toast__message { flex: 1; line-height: 1.4; }

.toast__close {
  margin-left: 4px;
  opacity: 0.5;
  font-size: 1.1rem;
  padding: 2px 4px;
}
.toast__close:hover { opacity: 1; }

/* Transition */
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(40px); }
.toast-leave-to     { opacity: 0; transform: translateX(40px); }
.toast-move         { transition: transform 0.3s ease; }

@media (max-width: 480px) {
  .toast-container {
    bottom: 16px;
    right: 16px;
    left: 16px;
  }
  .toast {
    max-width: 100%;
    width: 100%;
  }
}
</style>
