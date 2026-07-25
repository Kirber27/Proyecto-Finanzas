<script setup>
import { themeState, toggleTheme } from '../store/theme'

defineProps({
  small: { type: Boolean, default: false },
  withLabel: { type: Boolean, default: false },
})
</script>

<template>
  <div class="d-flex align-items-center gap-2">
    <span v-if="withLabel" style="font-size: 12px; color: var(--ink-soft); font-weight: 600">
      {{ themeState.theme === 'dark' ? 'Oscuro' : 'Claro' }}
    </span>
    <button
      type="button"
      class="theme-switch"
      :class="{ 'is-dark': themeState.theme === 'dark', sm: small }"
      :style="{ background: themeState.theme === 'dark' ? 'var(--accent)' : 'var(--toggle-track-off)' }"
      :aria-label="themeState.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      @click="toggleTheme"
    >
      <svg class="theme-switch-icon theme-switch-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <svg class="theme-switch-icon theme-switch-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
      <span class="theme-switch-thumb"></span>
    </button>
  </div>
</template>
