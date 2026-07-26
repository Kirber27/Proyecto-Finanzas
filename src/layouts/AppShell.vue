<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ThemeToggle from '../components/ThemeToggle.vue'
import MonthSelector from '../components/MonthSelector.vue'
import NavIcon from '../components/NavIcon.vue'
import MobileMenu from '../components/MobileMenu.vue'
import { authState, displayName, avatarLetter, logout } from '../store/auth'
import { state as finanzasState } from '../store/finanzas'

const route = useRoute()
const router = useRouter()

const TAB_TITLES = {
  resumen: 'Resumen',
  presupuesto: 'Presupuesto',
  cuentas: 'Cuentas',
  deudas: 'Deudas',
  metas: 'Metas y ahorro',
  gastos: 'Gastos diarios',
}

const NAV_ITEMS = [
  { name: 'resumen', icon: 'resumen', label: 'Resumen' },
  { name: 'presupuesto', icon: 'presupuesto', label: 'Presupuesto' },
  { name: 'cuentas', icon: 'cuentas', label: 'Cuentas' },
  { name: 'deudas', icon: 'deudas', label: 'Deudas' },
  { name: 'metas', icon: 'metas', label: 'Metas' },
  { name: 'gastos', icon: 'gastos', label: 'Gastos' },
]

const activeTab = computed(() => route.name)
const tabTitle = computed(() => TAB_TITLES[activeTab.value] || '')

function goTo(name) {
  router.push({ name })
}

async function onLogout() {
  await logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div style="min-height: 100vh; background: var(--bg)">
    <!-- Mobile layout -->
    <div class="d-flex d-lg-none flex-column" style="min-height: 100vh">
      <header style="padding: 22px 20px 14px; flex-shrink: 0">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <p class="eyebrow" style="letter-spacing: 0.08em; margin-bottom: 4px">{{ tabTitle }}</p>
            <h1 style="font-size: 20px; font-weight: 800; color: var(--ink); margin: 0">Hola, {{ displayName }}</h1>
          </div>
          <MobileMenu />
        </div>
      </header>

      <main style="flex: 1; overflow-y: auto; padding-bottom: 76px; padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px))">
        <p v-if="finanzasState.error" class="finanzas-error">{{ finanzasState.error }}</p>
        <p v-if="finanzasState.loading" class="finanzas-loading">Cargando tus datos…</p>
        <router-view v-else />
      </main>

      <nav class="bottom-nav">
        <button
          v-for="item in NAV_ITEMS"
          :key="item.name"
          type="button"
          class="bottom-nav-btn"
          :class="{ 'is-active': activeTab === item.name }"
          @click="goTo(item.name)"
        >
          <NavIcon :name="item.icon" :size="20" />
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </div>

    <!-- Desktop layout -->
    <div class="d-none d-lg-flex" style="min-height: 100vh">
      <aside
        style="
          width: 236px;
          flex-shrink: 0;
          background: var(--card-alt);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 22px 14px;
        "
      >
        <div class="d-flex align-items-center gap-2" style="padding: 0 8px; margin-bottom: 28px">
          <div
            style="width: 34px; height: 34px; border-radius: 9px; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0"
          >
            F
          </div>
          <span style="font-size: 15.5px; font-weight: 800; color: var(--ink)">Finanzas</span>
        </div>

        <nav class="d-flex flex-column gap-1" style="flex: 1">
          <button
            v-for="item in NAV_ITEMS"
            :key="item.name"
            type="button"
            class="sidebar-nav-item"
            :class="{ 'is-active': activeTab === item.name }"
            @click="goTo(item.name)"
          >
            <NavIcon :name="item.icon" :size="18" />
            {{ item.label }}
          </button>
        </nav>

        <div class="d-flex align-items-center gap-2" style="border-top: 1px solid var(--border); padding-top: 14px">
          <div
            style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0"
          >
            {{ avatarLetter }}
          </div>
          <div style="flex: 1; min-width: 0">
            <div style="font-size: 12.5px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
              {{ displayName }}
            </div>
            <button type="button" class="btn-fx-link" style="font-size: 10.5px; color: var(--ink-faint); font-weight: 600" @click="onLogout">
              Cerrar sesión
            </button>
          </div>
          <ThemeToggle small />
        </div>
      </aside>

      <div class="d-flex flex-column" style="flex: 1; min-width: 0">
        <div class="d-flex align-items-center justify-content-between" style="padding: 20px 32px; border-bottom: 1px solid var(--border); flex-shrink: 0">
          <div>
            <h1 style="font-size: 19px; font-weight: 800; color: var(--ink); margin: 0">{{ tabTitle }}</h1>
            <p style="font-size: 12px; color: var(--ink-faint); margin: 4px 0 0">Panel de control financiero</p>
          </div>
          <MonthSelector style="padding: 4px 6px" />
        </div>

        <main style="flex: 1; overflow-y: auto; padding: 26px 32px">
          <p v-if="finanzasState.error" class="finanzas-error">{{ finanzasState.error }}</p>
          <p v-if="finanzasState.loading" class="finanzas-loading">Cargando tus datos…</p>
          <router-view v-else />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finanzas-loading {
  text-align: center;
  color: var(--ink-faint);
  font-size: 13px;
  padding: 40px 0;
}
.finanzas-error {
  background: var(--bad-bg);
  color: var(--bad);
  border-radius: var(--radius-input-sm, 10px);
  padding: 10px 14px;
  font-size: 12.5px;
  font-weight: 600;
  margin: 0 0 14px;
}
</style>
