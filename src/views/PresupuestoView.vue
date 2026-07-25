<script setup>
import { computed } from 'vue'
import MonthSelector from '../components/MonthSelector.vue'
import {
  state, updatePresupuestoMonto, totalIngreso, totalGastoPresupuestado,
  gastoRealPorCategoria, totalGastoReal, saldoEstimado,
} from '../store/finanzas'
import { fmtCLP, MONTH_NAMES } from '../utils/format'

const mesLabel = computed(() => `${MONTH_NAMES[state.monthIndex]} de ${state.year}`)
const gastoRealColor = computed(() => (totalGastoReal.value > totalGastoPresupuestado.value ? 'var(--bad)' : 'var(--ink)'))
const saldoColor = computed(() => (saldoEstimado.value < 0 ? 'var(--bad)' : 'var(--good)'))

const ingresoRows = computed(() => state.presupuesto.filter((p) => p.tipo === 'ingreso'))

const gastoRows = computed(() =>
  state.presupuesto
    .filter((p) => p.tipo === 'gasto')
    .map((p) => {
      const real = gastoRealPorCategoria(p.nombre)
      const pct = p.monto > 0 ? Math.min(real / p.monto, 1) : real > 0 ? 1 : 0
      const over = p.monto > 0 && real > p.monto
      return {
        ...p,
        realFmt: fmtCLP(real),
        pctLabel: p.monto > 0 ? `${Math.round(pct * 100)}%` : '',
        pctWidth: `${pct * 100}%`,
        barColor: over ? 'var(--bad)' : 'var(--accent)',
      }
    })
)

function onMontoChange(id, e) {
  updatePresupuestoMonto(id, e.target.value)
}
</script>

<template>
  <div class="presupuesto-view">
    <MonthSelector class="d-lg-none" style="margin: 0 20px 14px; padding: 8px 6px" />

    <div class="presupuesto-grid">
      <div>
        <p class="eyebrow" style="margin: 0 0 8px">Ingresos mensuales</p>
        <div class="card-fx card-fx-sm" style="overflow: hidden">
          <div v-for="(row, i) in ingresoRows" :key="row.id" class="d-flex align-items-center gap-2 row-line" :class="{ 'border-top': i > 0 }">
            <div style="flex: 1; font-size: 13.5px; font-weight: 600; color: var(--ink)">{{ row.nombre }}</div>
            <input
              type="number"
              :value="row.monto"
              class="field-input"
              style="width: 116px; text-align: right; font-weight: 700; color: var(--accent)"
              @change="onMontoChange(row.id, $event)"
            />
          </div>
          <div class="d-flex justify-content-between total-row" style="background: var(--accent); color: #fff">
            <span>Total ingresos</span><span>{{ fmtCLP(totalIngreso) }}</span>
          </div>
        </div>
      </div>

      <div>
        <p class="eyebrow" style="margin: 0 0 8px">Gastos presupuestados</p>
        <div class="gasto-grid">
          <div v-for="row in gastoRows" :key="row.id" class="card-fx card-fx-sm gasto-card">
            <p class="gasto-card-nombre">{{ row.nombre }}</p>
            <label class="field-label">Monto</label>
            <input
              type="number"
              :value="row.monto"
              class="field-input"
              style="text-align: right; font-weight: 700; margin-bottom: 8px"
              @change="onMontoChange(row.id, $event)"
            />
            <div class="d-flex justify-content-between" style="font-size: 10.5px; color: var(--ink-faint); margin-bottom: 4px">
              <span>Real: {{ row.realFmt }}</span><span>{{ row.pctLabel }}</span>
            </div>
            <div class="progress-track sm">
              <div class="progress-fill" :style="{ background: row.barColor, width: row.pctWidth }"></div>
            </div>
          </div>
          <div class="card-fx card-fx-sm gasto-card gasto-card-total">
            <p class="eyebrow gasto-total-label">Total presupuestado</p>
            <p class="gasto-total-value">{{ fmtCLP(totalGastoPresupuestado) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="presupuesto-resumen">
      <div class="resumen-cards">
        <div class="kpi-tile">
          <p class="eyebrow" style="font-size: 10px; margin-bottom: 6px">Gasto real ({{ mesLabel }})</p>
          <p style="font-size: 17px; font-weight: 800; margin: 0" :style="{ color: gastoRealColor }">{{ fmtCLP(totalGastoReal) }}</p>
        </div>
        <div class="kpi-tile">
          <p class="eyebrow" style="font-size: 10px; margin-bottom: 6px">Saldo</p>
          <p style="font-size: 17px; font-weight: 800; margin: 0" :style="{ color: saldoColor }">{{ fmtCLP(saldoEstimado) }}</p>
        </div>
      </div>
      <p class="presupuesto-note">El "gasto real" se calcula automáticamente con lo que registras en la pestaña Gastos.</p>
    </div>
  </div>
</template>

<style scoped>
.presupuesto-view {
  padding: 0 20px 8px;
}
.presupuesto-view > p.eyebrow {
  margin-left: 0;
}
.presupuesto-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px 24px;
}
.row-line {
  padding: 11px 16px;
}
.total-row {
  padding: 12px 16px;
  font-weight: 700;
  font-size: 13px;
}
.border-top {
  border-top: 1px solid var(--border);
}

.gasto-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.gasto-card {
  padding: 14px;
  display: flex;
  flex-direction: column;
}
.gasto-card-nombre {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gasto-card-total {
  background: var(--ink);
  justify-content: center;
}
.gasto-total-label {
  color: var(--bg);
  opacity: 0.65;
  margin: 0 0 6px;
}
.gasto-total-value {
  color: var(--bg);
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}

.presupuesto-resumen {
  margin-top: 16px;
}
.resumen-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.presupuesto-note {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--ink-faint);
  text-align: center;
}

@media (min-width: 992px) {
  .presupuesto-view {
    padding: 0;
  }
  .presupuesto-grid {
    grid-template-columns: 1fr;
    align-items: start;
  }
  .row-line,
  .total-row {
    padding-left: 18px;
    padding-right: 18px;
  }
  .total-row {
    font-size: 14px;
  }
  .gasto-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
  .presupuesto-resumen {
    margin-top: 20px;
    max-width: 520px;
  }
}
</style>
