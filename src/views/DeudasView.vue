<script setup>
import { computed } from 'vue'
import {
  state, ESTADOS, addDeuda, deleteDeuda, updateDeuda,
  deudaTotal, pagoMinTotal, pagoRealTotal,
} from '../store/finanzas'
import { fmtCLP } from '../utils/format'

const estadoLabel = (value) => ESTADOS.find((e) => e.value === value)?.label || value

const deudas = computed(() =>
  state.debts.map((d) => {
    const meses = d.pagoReal > 0 ? Math.ceil(d.saldo / d.pagoReal) : null
    const badge =
      d.estado === 'late'
        ? { bg: 'var(--bad-bg)', fg: 'var(--bad)' }
        : d.estado === 'paid'
        ? { bg: 'var(--accent-soft)', fg: 'var(--accent)' }
        : { bg: 'var(--good-bg)', fg: 'var(--good)' }
    return { ...d, estadoLabel: estadoLabel(d.estado), mesesLabel: meses ? `${meses} meses restantes` : '—', badge }
  })
)

function onField(id, field, value) {
  updateDeuda(id, field, value)
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
            <label class="field-label">Institución</label>
            <input
              :value="d.institucion"
              class="field-input"
              placeholder="Ej: Banco Falabella"
              @change="onField(d.id, 'institucion', $event.target.value)"
            />
          </div>
          <div>
            <label class="field-label">Estado</label>
            <select :value="d.estado" class="field-input" @change="onField(d.id, 'estado', $event.target.value)">
              <option v-for="e in ESTADOS" :key="e.value" :value="e.value">{{ e.label }}</option>
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
          <div>
            <label class="field-label">Día de pago</label>
            <input
              type="number" min="1" max="31"
              :value="d.diaPago"
              class="field-input"
              placeholder="Ej: 5"
              @change="onField(d.id, 'diaPago', $event.target.value)"
            />
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center" style="margin-top: 12px">
          <span class="badge-pill" :style="{ background: d.badge.bg, color: d.badge.fg }">{{ d.estadoLabel }}</span>
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
