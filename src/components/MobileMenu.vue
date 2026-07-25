<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import { authState, displayName, avatarLetter, logout } from '../store/auth'

const router = useRouter()
const open = ref(false)

function close() {
  open.value = false
}

function onLogout() {
  close()
  logout()
  router.push({ name: 'login' })
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div>
    <button type="button" class="menu-kebab" aria-label="Abrir menú de cuenta" @click="open = true">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.9" />
        <circle cx="12" cy="12" r="1.9" />
        <circle cx="12" cy="19" r="1.9" />
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="menu-backdrop-fx">
        <div v-if="open" class="menu-backdrop" @click="close"></div>
      </Transition>
      <Transition name="menu-panel-fx">
        <div v-if="open" class="menu-panel" role="dialog" aria-modal="true" aria-label="Menú de cuenta">
          <div class="d-flex justify-content-between align-items-start" style="margin-bottom: 20px">
            <div class="d-flex align-items-center gap-2" style="min-width: 0">
              <div
                style="width: 36px; height: 36px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0"
              >
                {{ avatarLetter }}
              </div>
              <div style="min-width: 0">
                <div style="font-size: 13.5px; font-weight: 700; color: var(--ink)">{{ displayName }}</div>
                <div style="font-size: 11px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  {{ authState.email }}
                </div>
              </div>
            </div>
            <button type="button" class="btn-fx-ghost" style="font-size: 15px" aria-label="Cerrar menú" @click="close">✕</button>
          </div>

          <div class="menu-section">
            <p class="eyebrow" style="margin-bottom: 10px">Tema</p>
            <ThemeToggle with-label />
          </div>

          <button type="button" class="btn-fx-outline w-100" @click="onLogout">Cerrar sesión</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.menu-kebab {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--ink-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;
}
.menu-kebab:hover {
  background: var(--card-alt);
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 12, 20, 0.45);
  z-index: 1050;
}

.menu-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(300px, 85vw);
  background: var(--card);
  box-shadow: var(--shadow-frame);
  border-radius: 20px 0 0 20px;
  z-index: 1051;
  padding: 20px;
  padding-top: calc(20px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.menu-section {
  padding: 14px 0 18px;
  margin-bottom: 8px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  flex: 1;
}

.menu-backdrop-fx-enter-active,
.menu-backdrop-fx-leave-active {
  transition: opacity 0.2s ease;
}
.menu-backdrop-fx-enter-from,
.menu-backdrop-fx-leave-to {
  opacity: 0;
}

.menu-panel-fx-enter-active,
.menu-panel-fx-leave-active {
  transition: transform 0.22s ease;
}
.menu-panel-fx-enter-from,
.menu-panel-fx-leave-to {
  transform: translateX(100%);
}
</style>
