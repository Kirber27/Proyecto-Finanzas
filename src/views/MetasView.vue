<script setup>
import { computed } from 'vue'
import { state, addMeta, deleteMeta } from '../store/finanzas'
import { fmtCLP } from '../utils/format'

const metas = computed(() =>
  state.metas.map((m) => {
    const pct = m.objetivo > 0 ? Math.min(m.ahorrado / m.objetivo, 1) : 0
    return {
      ...m,
      pctLabel: `${Math.round(pct * 100)}%`,
      pctWidth: `${pct * 100}%`,
      faltanteFmt: fmtCLP(Math.max(m.objetivo - m.ahorrado, 0)),
    }
  })
)

function onField(id, field, value) {
  const row = state.metas.find((m) => m.id === id)
  if (!row) return
  const numFields = ['objetivo', 'ahorrado']
  row[field] = numFields.includes(field) ? Number(value) || 0 : value
}
</script>

<template>
  <div class="metas-view">
    <div class="meta-grid">
      <div v-for="m in metas" :key="m.id" class="card-fx card-fx-sm meta-card">
        <div class="d-flex justify-content-between align-items-start gap-2" style="margin-bottom: 12px">
          <input
            :value="m.nombre"
            class="field-input-plain"
            style="font-size: 15px; font-weight: 700; flex: 1"
            @change="onField(m.id, 'nombre', $event.target.value)"
          />
          <button type="button" class="btn-fx-ghost" style="font-size: 15px" @click="deleteMeta(m.id)" aria-label="Eliminar meta">✕</button>
        </div>

        <div class="meta-fields">
          <div>
            <label class="field-label">Monto objetivo</label>
            <input type="number" :value="m.objetivo" class="field-input" @change="onField(m.id, 'objetivo', $event.target.value)" />
          </div>
          <div>
            <label class="field-label">Ahorrado</label>
            <input type="number" :value="m.ahorrado" class="field-input" @change="onField(m.id, 'ahorrado', $event.target.value)" />
          </div>
          <div style="grid-column: 1 / -1">
            <label class="field-label">Fecha objetivo</label>
            <input type="date" :value="m.fecha" class="field-input" @change="onField(m.id, 'fecha', $event.target.value)" />
          </div>
        </div>

        <div style="margin-top: 12px">
          <div class="d-flex justify-content-between" style="font-size: 12px; font-weight: 700; color: var(--accent); margin-bottom: 4px">
            <span>{{ m.pctLabel }}</span>
            <span style="color: var(--ink-faint); font-weight: 600">faltan {{ m.faltanteFmt }}</span>
          </div>
          <div class="progress-track sm">
            <div class="progress-fill" style="background: var(--accent)" :style="{ width: m.pctWidth }"></div>
          </div>
        </div>
      </div>
    </div>

    <button type="button" class="btn-fx-primary add-btn" @click="addMeta">+ Agregar meta</button>
  </div>
</template>

<style scoped>
.metas-view {
  padding: 0 20px 12px;
}
.meta-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.meta-card {
  padding: 16px;
}
.meta-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.add-btn {
  width: 100%;
  margin-top: 12px;
}

@media (min-width: 992px) {
  .metas-view {
    padding: 0;
  }
  .meta-grid {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .meta-card {
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
