import { reactive, computed, watch } from 'vue'
import { todayISO, uid, MONTH_SHORT } from '../utils/format'

const STORAGE_KEY = 'finanzas.data.v1'

export const DEUDA_TIPOS = ['Tarjeta de crédito', 'Crédito de consumo', 'Línea de crédito', 'Otro']
export const ESTADOS = ['Al día', 'Atrasado', 'Pagada']
export const MEDIOS = ['Efectivo', 'Débito', 'Crédito', 'Transferencia']

const now = new Date()

function defaultState() {
  return {
    monthIndex: now.getMonth(),
    year: now.getFullYear(),
    presupuesto: [
      { id: 'p1', nombre: 'Sueldo líquido', tipo: 'ingreso', monto: 1450000 },
      { id: 'p2', nombre: 'Ingresos adicionales', tipo: 'ingreso', monto: 180000 },
      { id: 'p3', nombre: 'Otros ingresos', tipo: 'ingreso', monto: 0 },
      { id: 'p4', nombre: 'Arriendo/Dividendo', tipo: 'gasto', monto: 380000 },
      { id: 'p5', nombre: 'Servicios básicos', tipo: 'gasto', monto: 95000 },
      { id: 'p6', nombre: 'Alimentación', tipo: 'gasto', monto: 250000 },
      { id: 'p7', nombre: 'Transporte', tipo: 'gasto', monto: 60000 },
      { id: 'p8', nombre: 'Salud', tipo: 'gasto', monto: 40000 },
      { id: 'p9', nombre: 'Educación', tipo: 'gasto', monto: 0 },
      { id: 'p10', nombre: 'Entretenimiento', tipo: 'gasto', monto: 45000 },
      { id: 'p11', nombre: 'Deudas', tipo: 'gasto', monto: 150000 },
      { id: 'p12', nombre: 'Seguros', tipo: 'gasto', monto: 25000 },
      { id: 'p13', nombre: 'Otros', tipo: 'gasto', monto: 30000 },
    ],
    deudas: [
      { id: 'd1', nombre: 'Tarjeta Falabella', tipo: 'Tarjeta de crédito', saldo: 850000, tasa: 1.9, pagoMin: 85000, pagoReal: 100000, estado: 'Al día' },
      { id: 'd2', nombre: 'Crédito de consumo', tipo: 'Crédito de consumo', saldo: 1200000, tasa: 1.2, pagoMin: 65000, pagoReal: 65000, estado: 'Al día' },
    ],
    metas: [
      { id: 'm1', nombre: 'Fondo de emergencia', objetivo: 1500000, ahorrado: 400000, fecha: '2026-12-31' },
      { id: 'm2', nombre: 'Vacaciones', objetivo: 600000, ahorrado: 120000, fecha: '2027-02-01' },
    ],
    gastos: [
      { id: 'g1', monto: 8500, fecha: todayISO(), descripcion: 'Almuerzo', categoria: 'Alimentación', medio: 'Débito' },
      { id: 'g2', monto: 45000, fecha: todayISO(), descripcion: 'Supermercado', categoria: 'Alimentación', medio: 'Crédito' },
      { id: 'g3', monto: 6000, fecha: shiftDays(-1), descripcion: 'Bencina', categoria: 'Transporte', medio: 'Débito' },
      { id: 'g4', monto: 12000, fecha: shiftDays(-2), descripcion: 'Cine', categoria: 'Entretenimiento', medio: 'Crédito' },
      { id: 'g5', monto: 95000, fecha: shiftDays(-4), descripcion: 'Cuenta de luz', categoria: 'Servicios básicos', medio: 'Transferencia' },
    ],
    gastoForm: { monto: '', fecha: todayISO(), desc: '', cat: 'Alimentación', medio: 'Efectivo' },
  }
}

function shiftDays(delta) {
  const d = new Date()
  d.setDate(d.getDate() + delta)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...defaultState(), ...parsed }
    }
  } catch (e) {
    // ignore corrupt storage
  }
  return defaultState()
}

export const state = reactive(load())

watch(state, () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}, { deep: true })

export function prevMonth() {
  if (state.monthIndex === 0) {
    state.monthIndex = 11
    state.year -= 1
  } else {
    state.monthIndex -= 1
  }
}

export function nextMonth() {
  if (state.monthIndex === 11) {
    state.monthIndex = 0
    state.year += 1
  } else {
    state.monthIndex += 1
  }
}

export function updatePresupuestoMonto(id, val) {
  const row = state.presupuesto.find((p) => p.id === id)
  if (row) row.monto = Number(val) || 0
}

export function addDeuda() {
  state.deudas.push({
    id: uid(), nombre: 'Nueva deuda', tipo: DEUDA_TIPOS[0],
    saldo: 0, tasa: 0, pagoMin: 0, pagoReal: 0, estado: 'Al día',
  })
}

export function deleteDeuda(id) {
  state.deudas = state.deudas.filter((d) => d.id !== id)
}

export function addMeta() {
  state.metas.push({ id: uid(), nombre: 'Nueva meta', objetivo: 0, ahorrado: 0, fecha: todayISO() })
}

export function deleteMeta(id) {
  state.metas = state.metas.filter((m) => m.id !== id)
}

export function setGastoForm(field, val) {
  state.gastoForm[field] = val
}

export function addGasto() {
  const f = state.gastoForm
  if (!f.monto || Number(f.monto) <= 0) return
  state.gastos.push({
    id: uid(), monto: Number(f.monto), fecha: f.fecha || todayISO(),
    descripcion: f.desc, categoria: f.cat, medio: f.medio,
  })
  f.monto = ''
  f.desc = ''
}

export function deleteGasto(id) {
  state.gastos = state.gastos.filter((g) => g.id !== id)
}

export const gastoCats = computed(() => state.presupuesto.filter((p) => p.tipo === 'gasto').map((p) => p.nombre))

export const totalIngreso = computed(() =>
  state.presupuesto.filter((p) => p.tipo === 'ingreso').reduce((a, p) => a + p.monto, 0)
)

export const totalGastoPresupuestado = computed(() =>
  state.presupuesto.filter((p) => p.tipo === 'gasto').reduce((a, p) => a + p.monto, 0)
)

export const gastosDelMes = computed(() =>
  state.gastos.filter((g) => {
    const [y, m] = g.fecha.split('-').map(Number)
    return y === state.year && m - 1 === state.monthIndex
  })
)

export const totalGastoReal = computed(() => gastosDelMes.value.reduce((a, g) => a + g.monto, 0))

export const saldoEstimado = computed(() => totalIngreso.value - totalGastoReal.value)

export const tasaAhorro = computed(() => (totalIngreso.value > 0 ? saldoEstimado.value / totalIngreso.value : 0))

export const deudaTotal = computed(() => state.deudas.reduce((a, d) => a + d.saldo, 0))
export const pagoMinTotal = computed(() => state.deudas.reduce((a, d) => a + d.pagoMin, 0))
export const pagoRealTotal = computed(() => state.deudas.reduce((a, d) => a + d.pagoReal, 0))

export const metaObjetivoTotal = computed(() => state.metas.reduce((a, m) => a + m.objetivo, 0))
export const metaAhorradoTotal = computed(() => state.metas.reduce((a, m) => a + m.ahorrado, 0))

export function gastoRealPorCategoria(nombre) {
  return gastosDelMes.value.filter((g) => g.categoria === nombre).reduce((a, g) => a + g.monto, 0)
}

export const gastoHoy = computed(() =>
  state.gastos.filter((g) => g.fecha === todayISO()).reduce((a, g) => a + g.monto, 0)
)

// ---- Proyección mensual (mes en vista + próximos 5) ----
// Todo lo que sigue son proyecciones calculadas a partir del estado actual, no
// historial real: el store solo guarda una "foto" vigente de presupuesto/deudas/metas.

function monthsWindow(count = 6) {
  const months = []
  let monthIndex = state.monthIndex
  let year = state.year
  for (let i = 0; i < count; i++) {
    months.push({ monthIndex, year, month: MONTH_SHORT[monthIndex], label: `${MONTH_SHORT[monthIndex]} ${year}` })
    monthIndex += 1
    if (monthIndex > 11) {
      monthIndex = 0
      year += 1
    }
  }
  return months
}

// Ingresos presupuestados no varían mes a mes en el modelo actual: se proyecta
// como una línea constante (ver .kiro/specs/finanzas-app/tasks.md #19 para el gap).
export const proyeccionIngresos = computed(() =>
  monthsWindow().map((m) => ({ month: m.month, label: m.label, value: totalIngreso.value, projected: false }))
)

// El mes en vista usa el gasto real ya registrado; los meses futuros asumen que
// el gasto seguirá el presupuesto (mismo criterio que la comparación de color en Presupuesto).
export const proyeccionGastos = computed(() =>
  monthsWindow().map((m, i) => ({
    month: m.month,
    label: m.label,
    value: i === 0 ? totalGastoReal.value : totalGastoPresupuestado.value,
    projected: i > 0,
  }))
)

// Simula el pago de cada deuda por separado con su "pago que harás" mensual,
// piso en 0 — así una deuda que se termina de pagar no sigue restando del total.
export const proyeccionDeudas = computed(() => {
  const saldos = state.deudas.map((d) => d.saldo)
  return monthsWindow().map((m, i) => {
    if (i > 0) {
      state.deudas.forEach((d, idx) => {
        saldos[idx] = Math.max(saldos[idx] - d.pagoReal, 0)
      })
    }
    return { month: m.month, label: m.label, value: saldos.reduce((a, s) => a + s, 0), projected: i > 0 }
  })
})

// Proyecta el ahorro acumulado sumando el saldo estimado del mes (si es positivo)
// como aporte mensual constante, tope en el objetivo total de las metas.
export const proyeccionAhorros = computed(() => {
  const aporteMensual = Math.max(saldoEstimado.value, 0)
  const objetivo = metaObjetivoTotal.value
  let total = metaAhorradoTotal.value
  return monthsWindow().map((m, i) => {
    if (i > 0) total = objetivo > 0 ? Math.min(total + aporteMensual, objetivo) : total + aporteMensual
    return { month: m.month, label: m.label, value: total, projected: i > 0 }
  })
})

// ---- Historial mensual (5 meses anteriores + mes en vista) ----
// Mismo modelo de "foto" única vigente que la proyección hacia adelante: no hay
// serie histórica real de ingresos/deudas/ahorro por mes (ver tarea 20 en
// tasks.md), así que esos tres se reconstruyen hacia atrás con la misma lógica
// lineal usada para proyectar hacia adelante. Los gastos sí tienen fecha real
// por transacción, así que su historial se agrega desde `state.gastos`.

function monthsWindowBack(count = 6) {
  const months = []
  let monthIndex = state.monthIndex
  let year = state.year
  for (let i = 0; i < count; i++) {
    months.unshift({ monthIndex, year, month: MONTH_SHORT[monthIndex], label: `${MONTH_SHORT[monthIndex]} ${year}` })
    monthIndex -= 1
    if (monthIndex < 0) {
      monthIndex = 11
      year -= 1
    }
  }
  return months
}

function gastoTotalDelMes(year, monthIndex) {
  return state.gastos
    .filter((g) => {
      const [y, m] = g.fecha.split('-').map(Number)
      return y === year && m - 1 === monthIndex
    })
    .reduce((a, g) => a + g.monto, 0)
}

// Los ingresos presupuestados no varían mes a mes en el modelo actual (mismo gap
// que proyeccionIngresos), así que el historial se ve como una línea constante.
export const historialIngresos = computed(() => {
  const months = monthsWindowBack()
  const last = months.length - 1
  return months.map((m, i) => ({ month: m.month, label: m.label, value: totalIngreso.value, projected: i < last }))
})

// Gasto real por transacción: la única serie con historial genuino (no estimado).
export const historialGastos = computed(() =>
  monthsWindowBack().map((m) => ({
    month: m.month, label: m.label, value: gastoTotalDelMes(m.year, m.monthIndex), projected: false,
  }))
)

// Reconstruye el saldo de cada deuda hacia atrás sumando el pago que se hizo cada
// mes (lineal, sin interés — mismo criterio que proyeccionDeudas / gap #21).
export const historialDeudas = computed(() => {
  const months = monthsWindowBack()
  const n = months.length
  const saldos = state.deudas.map((d) => d.saldo)
  const values = new Array(n)
  values[n - 1] = saldos.reduce((a, s) => a + s, 0)
  for (let i = n - 2; i >= 0; i--) {
    state.deudas.forEach((d, idx) => { saldos[idx] += d.pagoReal })
    values[i] = saldos.reduce((a, s) => a + s, 0)
  }
  return months.map((m, i) => ({ month: m.month, label: m.label, value: values[i], projected: i < n - 1 }))
})

// Reconstruye el ahorro acumulado hacia atrás restando el mismo aporte mensual
// constante usado en proyeccionAhorros, con piso en 0.
export const historialAhorros = computed(() => {
  const months = monthsWindowBack()
  const n = months.length
  const aporteMensual = Math.max(saldoEstimado.value, 0)
  const values = new Array(n)
  values[n - 1] = metaAhorradoTotal.value
  for (let i = n - 2; i >= 0; i--) {
    values[i] = Math.max(values[i + 1] - aporteMensual, 0)
  }
  return months.map((m, i) => ({ month: m.month, label: m.label, value: values[i], projected: i < n - 1 }))
})
