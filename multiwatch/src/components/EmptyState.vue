<template>
  <div class="empty-state" role="status" aria-live="polite">
    <div class="empty-state__icon" aria-hidden="true">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
        <polyline points="17 2 12 7 7 2"/>
      </svg>
    </div>
    <h2 class="empty-state__title">No videos yet</h2>
    <p class="empty-state__desc">
      Paste a <strong>YouTube</strong>, <strong>Twitch</strong>, or <strong>Kick</strong> URL
      in the bar above and click <strong>Add</strong> to start watching.
    </p>

    <div class="empty-state__badges">
      <span class="platform-badge platform-badge--yt">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.52V8.48L15.84 12l-6.09 3.52z"/></svg>
        YouTube
      </span>
      <span class="platform-badge platform-badge--tw">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
        Twitch
      </span>
      <span class="platform-badge platform-badge--ki">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg>
        Kick
      </span>
    </div>

    <p class="empty-state__hint">
      Tip: you can also share a session via the <strong>Share</strong> button and paste that URL to restore it.
    </p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 24px;
  color: var(--text-muted);
  min-height: 60vh;
  gap: 12px;
}

.empty-state__icon {
  margin-bottom: 8px;
  opacity: 0.35;
}

.empty-state__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  opacity: 0.7;
}

.empty-state__desc {
  font-size: 0.95rem;
  max-width: 420px;
  line-height: 1.6;
}
.empty-state__desc strong { color: var(--text-primary); font-weight: 500; }

.empty-state__badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}

.platform-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid var(--border);
  background: var(--surface-raised);
}
.platform-badge--yt { color: #ff4444; border-color: rgba(255,68,68,0.3); }
.platform-badge--tw { color: #9146ff; border-color: rgba(145,70,255,0.3); }
.platform-badge--ki { color: #53fc18; border-color: rgba(83,252,24,0.3); }

.empty-state__hint {
  font-size: 0.8rem;
  margin-top: 16px;
  opacity: 0.6;
  max-width: 360px;
}
.empty-state__hint strong { font-weight: 500; }
</style>
