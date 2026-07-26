<script setup>
import { computed, watch } from 'vue'
import {
  state, gastoCategorias, gastoHoy, totalGastoReal, gastosDelMes,
  setGastoForm, addGasto, deleteGasto,
} from '../store/finanzas'
import { themeState } from '../store/theme'
import { fmtCLP, colorForCategory, todayISO } from '../utils/format'

const isDark = computed(() => themeState.theme === 'dark')

// Selecciona por defecto la primera cuenta/categoría disponible apenas cargan,
// para que el formulario quede usable sin que el usuario tenga que elegir cada vez.
watch(
  () => state.accounts,
  (accs) => {
    if (!state.gastoForm.accountId && accs.length) setGastoForm('accountId', accs[0].id)
  },
  { immediate: true }
)
watch(
  gastoCategorias,
  (cats) => {
    if (!state.gastoForm.categoryId && cats.length) setGastoForm('categoryId', cats[0].id)
  },
  { immediate: true }
)

function categoriaNombre(categoryId) {
  return state.categories.find((c) => c.id === categoryId)?.nombre || 'Sin categoría'
}
function cuentaNombre(accountId) {
  return state.accounts.find((a) => a.id === accountId)?.nombre || ''
}

const gastoGroups = computed(() => {
  const byDate = {}
  gastosDelMes.value.forEach((g) => {
    ;(byDate[g.fecha] = byDate[g.fecha] || []).push(g)
  })
  const today = todayISO()
  const yesterdayDt = new Date()
  yesterdayDt.setDate(yesterdayDt.getDate() - 1)
  const yesterday = new Date(yesterdayDt.getTime() - yesterdayDt.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10)

  return Object.keys(byDate)
    .sort((a, b) => b.localeCompare(a))
    .map((iso) => {
      const items = byDate[iso]
      const total = items.reduce((a, g) => a + g.monto, 0)
      let label
      if (iso === today) label = 'Hoy'
      else if (iso === yesterday) label = 'Ayer'
      else {
        const [y, mo, da] = iso.split('-').map(Number)
        label = new Date(y, mo - 1, da).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })
      }
      return {
        iso,
        label,
        totalFmt: fmtCLP(total),
        items: items.map((g) => ({
          id: g.id,
          desc: g.descripcion || categoriaNombre(g.categoryId),
          meta: `${categoriaNombre(g.categoryId)} · ${cuentaNombre(g.accountId)}`,
          montoFmt: fmtCLP(g.monto),
          dot: colorForCategory(categoriaNombre(g.categoryId), isDark.value),
        })),
      }
    })
})

function onSubmit() {
  addGasto()
}
</script>

<template>
  <div class="gastos-view">
    <div class="gastos-layout">
      <div class="card-fx card-fx-sm gasto-form">
        <p class="eyebrow" style="margin-bottom: 14px">Agregar gasto</p>
        <form novalidate @submit.prevent="onSubmit">
          <div class="row-2" style="margin-bottom: 12px">
            <div>
              <label class="field-label">Monto</label>
              <input
                type="number"
                :value="state.gastoForm.monto"
                placeholder="0"
                class="field-input"
                @input="setGastoForm('monto', $event.target.value)"
              />
            </div>
            <div>
              <label class="field-label">Fecha</label>
              <input
                type="date"
                :value="state.gastoForm.fecha"
                class="field-input"
                @input="setGastoForm('fecha', $event.target.value)"
              />
            </div>
          </div>

          <div style="margin-bottom: 12px">
            <label class="field-label">Descripción</label>
            <input
              type="text"
              :value="state.gastoForm.desc"
              placeholder="Ej: Almuerzo, bencina..."
              class="field-input"
              @input="setGastoForm('desc', $event.target.value)"
            />
          </div>

          <div class="row-2" style="margin-bottom: 16px">
            <div>
              <label class="field-label">Categoría</label>
              <select :value="state.gastoForm.categoryId" class="field-input" @change="setGastoForm('categoryId', $event.target.value)">
                <option v-for="cat in gastoCategorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="field-label">Cuenta</label>
              <select :value="state.gastoForm.accountId" class="field-input" @change="setGastoForm('accountId', $event.target.value)">
                <option v-for="acc in state.accounts" :key="acc.id" :value="acc.id">{{ acc.nombre }}</option>
              </select>
            </div>
          </div>

          <p v-if="state.accounts.length === 0" style="color: var(--bad); font-size: 12px; margin: -8px 0 12px">
            Crea una cuenta primero en la pestaña Cuentas.
          </p>

          <button type="submit" class="btn-fx-primary w-100" :disabled="state.accounts.length === 0">Agregar gasto</button>
        </form>
      </div>

      <div class="gasto-history">
        <div class="kpi-grid">
          <div class="kpi-tile">
            <p class="eyebrow" style="font-size: 10.5px; margin-bottom: 6px">Hoy</p>
            <p style="font-size: 17px; font-weight: 800; color: var(--ink); margin: 0">{{ fmtCLP(gastoHoy) }}</p>
          </div>
          <div class="kpi-tile">
            <p class="eyebrow" style="font-size: 10.5px; margin-bottom: 6px">Este mes</p>
            <p style="font-size: 17px; font-weight: 800; color: var(--ink); margin: 0">{{ fmtCLP(totalGastoReal) }}</p>
          </div>
        </div>

        <p v-if="gastoGroups.length === 0" style="color: var(--ink-faint); font-size: 13px">Sin gastos registrados este mes.</p>

        <div v-for="grp in gastoGroups" :key="grp.iso">
          <div class="d-flex justify-content-between" style="padding: 6px 2px; font-size: 12px; font-weight: 700; color: var(--ink); text-transform: capitalize">
            <span>{{ grp.label }}</span><span style="color: var(--ink-faint); font-weight: 600">{{ grp.totalFmt }}</span>
          </div>
          <div class="card-fx card-fx-sm" style="overflow: hidden; margin-bottom: 14px">
            <div v-for="g in grp.items" :key="g.id" class="d-flex align-items-center gap-2 gasto-row">
              <span class="cat-dot" :style="{ background: g.dot }"></span>
              <div style="flex: 1; min-width: 0">
                <div style="font-size: 13.5px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  {{ g.desc }}
                </div>
                <div style="font-size: 10.5px; color: var(--ink-faint)">{{ g.meta }}</div>
              </div>
              <div style="font-weight: 700; font-size: 13.5px; color: var(--bad); white-space: nowrap">{{ g.montoFmt }}</div>
              <button type="button" class="btn-fx-ghost" style="font-size: 12px" @click="deleteGasto(g.id)" aria-label="Eliminar gasto">✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gastos-view {
  padding: 0 20px 12px;
}
.gastos-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.gasto-form {
  padding: 16px;
}
.row-2 {
  display: flex;
  gap: 10px;
}
.row-2 > div {
  flex: 1;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
.gasto-row {
  padding: 10px 14px;
}

@media (min-width: 992px) {
  .gastos-view {
    padding: 0;
  }
  .gastos-layout {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 20px;
    align-items: start;
  }
  .gasto-form {
    padding: 20px;
  }
  .kpi-grid {
    gap: 14px;
    margin-bottom: 16px;
  }
  .gasto-row {
    padding: 11px 16px;
  }
}
</style>
