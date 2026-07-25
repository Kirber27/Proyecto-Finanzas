<script setup>
import { computed } from 'vue'
import {
  state, DEUDA_TIPOS, ESTADOS, addDeuda, deleteDeuda,
  deudaTotal, pagoMinTotal, pagoRealTotal,
} from '../store/finanzas'
import { fmtCLP } from '../utils/format'

const deudas = computed(() =>
  state.deudas.map((d) => {
    const meses = d.pagoReal > 0 ? Math.ceil(d.saldo / d.pagoReal) : null
    const badge =
      d.estado === 'Atrasado'
        ? { bg: 'var(--bad-bg)', fg: 'var(--bad)' }
        : d.estado === 'Pagada'
        ? { bg: 'var(--accent-soft)', fg: 'var(--accent)' }
        : { bg: 'var(--good-bg)', fg: 'var(--good)' }
    return { ...d, mesesLabel: meses ? `${meses} meses restantes` : '—', badge }
  })
)

function onField(id, field, value) {
  const row = state.deudas.find((d) => d.id === id)
  if (!row) return
  const numFields = ['saldo', 'tasa', 'pagoMin', 'pagoReal']
  row[field] = numFields.includes(field) ? Number(value) || 0 : value
}
</script>

<template>
  <div class="deudas-view">
    <div class="kpi-grid">
      <div class="kpi-tile">
        <p class="eyebrow" style="font-size: 10px; margin-bottom: 6px">Deuda total</p>
        <p style="font-size: 17px; font-weight: 800; color: var(--bad); margin: 0">{{ fmtCLP(deudaTotal) }}</p>
      </div>
      <div class="kpi-tile">
        <p class="eyebrow" style="font-size: 10px; margin-bottom: 6px">Pago mínimo</p>
        <p style="font-size: 17px; font-weight: 800; color: var(--ink); margin: 0">{{ fmtCLP(pagoMinTotal) }}</p>
      </div>
      <div class="kpi-tile kpi-desktop-only">
        <p class="eyebrow" style="font-size: 10px; margin-bottom: 6px">Pago comprometido</p>
        <p style="font-size: 17px; font-weight: 800; color: var(--accent); margin: 0">{{ fmtCLP(pagoRealTotal) }}</p>
      </div>
    </div>

    <div class="deuda-grid">
      <div v-for="d in deudas" :key="d.id" class="card-fx card-fx-sm deuda-card">
        <div class="d-flex justify-content-between align-items-start gap-2" style="margin-bottom: 12px">
          <input
            :value="d.nombre"
            class="field-input-plain"
            style="font-size: 15px; font-weight: 700; flex: 1"
            @change="onField(d.id, 'nombre', $event.target.value)"
          />
          <button type="button" class="btn-fx-ghost" style="font-size: 15px" @click="deleteDeuda(d.id)" aria-label="Eliminar deuda">✕</button>
        </div>

        <div class="deuda-fields">
          <div>
            <label class="field-label">Tipo</label>
            <select :value="d.tipo" class="field-input" @change="onField(d.id, 'tipo', $event.target.value)">
              <option v-for="t in DEUDA_TIPOS" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="field-label">Estado</label>
            <select :value="d.estado" class="field-input" @change="onField(d.id, 'estado', $event.target.value)">
              <option v-for="e in ESTADOS" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>
          <div>
            <label class="field-label">Saldo actual</label>
            <input type="number" :value="d.saldo" class="field-input" @change="onField(d.id, 'saldo', $event.target.value)" />
          </div>
          <div>
            <label class="field-label">Tasa mensual %</label>
            <input type="number" step="0.1" :value="d.tasa" class="field-input" @change="onField(d.id, 'tasa', $event.target.value)" />
          </div>
          <div>
            <label class="field-label">Pago mínimo</label>
            <input type="number" :value="d.pagoMin" class="field-input" @change="onField(d.id, 'pagoMin', $event.target.value)" />
          </div>
          <div>
            <label class="field-label">Pago que harás</label>
            <input type="number" :value="d.pagoReal" class="field-input" @change="onField(d.id, 'pagoReal', $event.target.value)" />
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center" style="margin-top: 12px">
          <span class="badge-pill" :style="{ background: d.badge.bg, color: d.badge.fg }">{{ d.estado }}</span>
          <span style="font-size: 11px; color: var(--ink-faint)">{{ d.mesesLabel }}</span>
        </div>
      </div>
    </div>

    <button type="button" class="btn-fx-primary add-btn" @click="addDeuda">+ Agregar deuda</button>
  </div>
</template>

<style scoped>
.deudas-view {
  padding: 0 20px 12px;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
.kpi-desktop-only {
  display: none;
}
.deuda-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.deuda-card {
  padding: 16px;
}
.deuda-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.add-btn {
  width: 100%;
  margin-top: 12px;
}

@media (min-width: 992px) {
  .deudas-view {
    padding: 0;
  }
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }
  .kpi-desktop-only {
    display: block;
  }
  .deuda-grid {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .deuda-card {
    padding: 18px;
  }
  .add-btn {
    width: auto;
    margin-top: 14px;
    padding-left: 22px;
    padding-right: 22px;
  }
}
</style>
