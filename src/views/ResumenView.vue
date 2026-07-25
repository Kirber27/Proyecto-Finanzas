<script setup>
import { computed } from 'vue'
import MonthSelector from '../components/MonthSelector.vue'
import ProjectionSparkline from '../components/ProjectionSparkline.vue'
import {
  totalIngreso, totalGastoReal, saldoEstimado, tasaAhorro,
  deudaTotal, metaObjetivoTotal, metaAhorradoTotal,
  proyeccionIngresos, proyeccionGastos, proyeccionDeudas, proyeccionAhorros,
  historialIngresos, historialGastos, historialDeudas, historialAhorros,
} from '../store/finanzas'
import { fmtCLP } from '../utils/format'

const gastoRealColor = computed(() => (totalGastoReal.value > totalIngreso.value ? 'var(--bad)' : 'var(--ink)'))
const saldoColor = computed(() => (saldoEstimado.value < 0 ? 'var(--bad)' : 'var(--good)'))
const tasaColor = computed(() => (tasaAhorro.value >= 0.2 ? 'var(--good)' : 'var(--bad)'))
const tasaWidth = computed(() => `${Math.min(Math.max(tasaAhorro.value, 0), 1) * 100}%`)
const metaPct = computed(() => (metaObjetivoTotal.value > 0 ? Math.min(metaAhorradoTotal.value / metaObjetivoTotal.value, 1) : 0))

const kpis = computed(() => [
  { label: 'Ingresos', value: fmtCLP(totalIngreso.value), color: 'var(--ink)' },
  { label: 'Gasto real', value: fmtCLP(totalGastoReal.value), color: gastoRealColor.value },
  { label: 'Saldo estimado', value: fmtCLP(saldoEstimado.value), color: saldoColor.value },
  { label: 'Deuda total', value: fmtCLP(deudaTotal.value), color: 'var(--ink)' },
])

const proyecciones = computed(() => [
  { key: 'ingresos', label: 'Proyección de ingresos', value: fmtCLP(totalIngreso.value), color: 'var(--accent)', points: proyeccionIngresos.value },
  { key: 'gastos', label: 'Proyección de gastos', value: fmtCLP(totalGastoReal.value), color: 'var(--bad)', points: proyeccionGastos.value },
  { key: 'deudas', label: 'Proyección de deudas', value: fmtCLP(deudaTotal.value), color: 'var(--ink)', points: proyeccionDeudas.value },
  { key: 'ahorros', label: 'Proyección de ahorros', value: fmtCLP(metaAhorradoTotal.value), color: 'var(--good)', points: proyeccionAhorros.value },
])

const historiales = computed(() => [
  { key: 'ingresos', label: 'Historial de ingresos', value: fmtCLP(totalIngreso.value), color: 'var(--accent)', points: historialIngresos.value },
  { key: 'gastos', label: 'Historial de gastos', value: fmtCLP(totalGastoReal.value), color: 'var(--bad)', points: historialGastos.value },
  { key: 'deudas', label: 'Historial de deudas', value: fmtCLP(deudaTotal.value), color: 'var(--ink)', points: historialDeudas.value },
  { key: 'ahorros', label: 'Historial de ahorros', value: fmtCLP(metaAhorradoTotal.value), color: 'var(--good)', points: historialAhorros.value },
])
</script>

<template>
  <div class="resumen-view">
    <MonthSelector class="d-lg-none" style="margin: 0 20px 14px; padding: 8px 6px" />

    <div class="kpi-grid">
      <div v-for="kpi in kpis" :key="kpi.label" class="kpi-tile">
        <p class="eyebrow" style="font-size: 10px; margin-bottom: 6px">{{ kpi.label }}</p>
        <p class="kpi-value" :style="{ color: kpi.color }" style="font-size: 17px; font-weight: 800; margin: 0">{{ kpi.value }}</p>
      </div>
    </div>

    <div class="detail-grid">
      <div class="card-fx card-fx-sm" style="padding: 18px">
        <p class="eyebrow" style="margin-bottom: 10px">Tasa de ahorro</p>
        <div class="d-flex justify-content-between align-items-baseline" style="margin-bottom: 10px">
          <span :style="{ color: tasaColor }" style="font-size: 26px; font-weight: 800">{{ (tasaAhorro * 100).toFixed(1) }}%</span>
          <span style="font-size: 11px; color: var(--ink-faint)">meta: 20%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ background: tasaColor, width: tasaWidth }"></div>
        </div>
      </div>

      <div class="card-fx card-fx-sm" style="padding: 18px">
        <p class="eyebrow" style="margin-bottom: 10px">Metas de ahorro</p>
        <div class="d-flex justify-content-between" style="font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 8px">
          <span>{{ fmtCLP(metaAhorradoTotal) }} ahorrados</span>
          <span style="color: var(--ink-faint); font-weight: 600">de {{ fmtCLP(metaObjetivoTotal) }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="background: var(--accent)" :style="{ width: `${metaPct * 100}%` }"></div>
        </div>
      </div>
    </div>

    <p class="eyebrow" style="margin: 18px 0 10px">Proyección mensual (próximos 6 meses)</p>
    <div class="projection-grid">
      <div v-for="p in proyecciones" :key="p.key" class="card-fx card-fx-sm" style="padding: 16px">
        <p class="eyebrow" style="font-size: 10px; margin-bottom: 4px">{{ p.label }}</p>
        <p style="font-size: 16px; font-weight: 800; color: var(--ink); margin: 0 0 8px">{{ p.value }}</p>
        <ProjectionSparkline :points="p.points" :color="p.color" />
      </div>
    </div>

    <p class="eyebrow" style="margin: 18px 0 10px">Historial mensual (últimos 6 meses)</p>
    <div class="projection-grid">
      <div v-for="h in historiales" :key="h.key" class="card-fx card-fx-sm" style="padding: 16px">
        <p class="eyebrow" style="font-size: 10px; margin-bottom: 4px">{{ h.label }}</p>
        <p style="font-size: 16px; font-weight: 800; color: var(--ink); margin: 0 0 8px">{{ h.value }}</p>
        <ProjectionSparkline :points="h.points" :color="h.color" projected-label="estimado" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.resumen-view {
  padding: 0 20px 8px;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.projection-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

@media (min-width: 992px) {
  .resumen-view {
    padding: 0;
  }
  .kpi-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 20px;
  }
  .detail-grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .projection-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
}
</style>
