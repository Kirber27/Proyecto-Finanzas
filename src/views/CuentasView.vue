<script setup>
import { computed } from 'vue'
import { state, ACCOUNT_TIPOS, addCuenta, deleteCuenta, updateCuenta } from '../store/finanzas'
import { fmtCLP } from '../utils/format'

const cuentas = computed(() => state.accounts)
const saldoTotal = computed(() => state.accounts.reduce((a, c) => a + c.saldoInicial, 0))

function onField(id, field, value) {
  updateCuenta(id, field, value)
}
</script>

<template>
  <div class="cuentas-view">
    <div class="kpi-grid">
      <div class="kpi-tile">
        <p class="eyebrow" style="font-size: 10px; margin-bottom: 6px">Saldo inicial total</p>
        <p style="font-size: 17px; font-weight: 800; color: var(--ink); margin: 0">{{ fmtCLP(saldoTotal) }}</p>
      </div>
    </div>

    <div class="cuenta-grid">
      <div v-for="c in cuentas" :key="c.id" class="card-fx card-fx-sm cuenta-card">
        <div class="d-flex justify-content-between align-items-start gap-2" style="margin-bottom: 12px">
          <input
            :value="c.nombre"
            class="field-input-plain"
            style="font-size: 15px; font-weight: 700; flex: 1"
            @change="onField(c.id, 'nombre', $event.target.value)"
          />
          <button type="button" class="btn-fx-ghost" style="font-size: 15px" @click="deleteCuenta(c.id)" aria-label="Eliminar cuenta">✕</button>
        </div>

        <div class="cuenta-fields">
          <div>
            <label class="field-label">Tipo</label>
            <select :value="c.tipo" class="field-input" @change="onField(c.id, 'tipo', $event.target.value)">
              <option v-for="t in ACCOUNT_TIPOS" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div>
            <label class="field-label">Saldo inicial</label>
            <input
              type="number"
              :value="c.saldoInicial"
              class="field-input"
              @change="onField(c.id, 'saldoInicial', $event.target.value)"
            />
          </div>
        </div>
      </div>
    </div>

    <button type="button" class="btn-fx-primary add-btn" @click="addCuenta">+ Agregar cuenta</button>
  </div>
</template>

<style scoped>
.cuentas-view {
  padding: 0 20px 12px;
}
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 14px;
}
.cuenta-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  min-width: 0;
}
.cuenta-card {
  padding: 16px;
  min-width: 0;
}
.cuenta-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  min-width: 0;
}
.add-btn {
  width: 100%;
  margin-top: 12px;
}

@media (min-width: 992px) {
  .cuentas-view {
    padding: 0;
  }
  .kpi-grid {
    max-width: 260px;
    margin-bottom: 18px;
  }
  .cuenta-grid {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .cuenta-card {
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
