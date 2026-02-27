import { ref } from 'vue';

const toasts = ref([]);
let nextId = 0;

export function useToast() {
  function show(message, type = 'info', duration = 3000) {
    const id = ++nextId;
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  const success = (msg, dur)  => show(msg, 'success', dur);
  const error   = (msg, dur)  => show(msg, 'error',   dur);
  const info    = (msg, dur)  => show(msg, 'info',     dur);
  const warning = (msg, dur)  => show(msg, 'warning',  dur);

  return { toasts, show, dismiss, success, error, info, warning };
}
