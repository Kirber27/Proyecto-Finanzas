import { reactive, computed, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { authState, authReady } from './auth'
import { todayISO, MONTH_SHORT } from '../utils/format'

const UI_STORAGE_KEY = 'finanzas.ui.v1'

export const ACCOUNT_TIPOS = [
  { value: 'checking', label: 'Cuenta corriente' },
  { value: 'savings', label: 'Cuenta de ahorro' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'credit_card', label: 'Tarjeta de crédito' },
  { value: 'investment', label: 'Inversión' },
]

export const ESTADOS = [
  { value: 'current', label: 'Al día' },
  { value: 'late', label: 'Atrasado' },
  { value: 'paid', label: 'Pagada' },
]

export const METAS_ESTADOS = [
  { value: 'active', label: 'Activa' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
]

const CATEGORY_TYPE_TO_DB = { ingreso: 'income', gasto: 'expense' }
const CATEGORY_TYPE_FROM_DB = { income: 'ingreso', expense: 'gasto' }
const TX_TYPE_FROM_DB = { income: 'ingreso', expense: 'gasto', transfer: 'transferencia' }

function defaultUiState() {
  const now = new Date()
  return { monthIndex: now.getMonth(), year: now.getFullYear() }
}

function loadUiState() {
  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY)
    if (raw) return { ...defaultUiState(), ...JSON.parse(raw) }
  } catch (e) {
    // ignore corrupt storage
  }
  return defaultUiState()
}

// `accounts`/`categories`/`budgets`/`debts`/`goals`/`transactions` viven en
// Supabase (aisladas por RLS). `monthIndex`/`year` y `gastoForm` son
// preferencia/borrador de UI local, no hace falta sincronizarlos.
export const state = reactive({
  ...loadUiState(),
  loading: true,
  error: '',
  accounts: [],
  categories: [],
  budgets: [],
  debts: [],
  goals: [],
  transactions: [],
  gastoForm: { monto: '', fecha: todayISO(), desc: '', categoryId: '', accountId: '' },
})

watch(
  () => ({ monthIndex: state.monthIndex, year: state.year }),
  (val) => localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(val))
)

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

// ---- Carga y mapeo desde Supabase ----

function mapAccount(row) {
  return { id: row.id, nombre: row.name, tipo: row.type, moneda: row.currency, saldoInicial: Number(row.initial_balance) }
}
function mapCategory(row) {
  return { id: row.id, nombre: row.name, tipo: CATEGORY_TYPE_FROM_DB[row.type] || row.type }
}
function mapBudget(row) {
  return { id: row.id, categoryId: row.category_id, monto: Number(row.amount), month: row.month, year: row.year }
}
function mapDebt(row) {
  return {
    id: row.id,
    institucion: row.institution,
    nombre: row.name,
    saldo: Number(row.balance),
    tasa: Number(row.interest_rate),
    pagoMin: Number(row.minimum_payment),
    pagoReal: Number(row.current_payment),
    diaPago: row.due_day,
    estado: row.status,
  }
}
function mapGoal(row) {
  return {
    id: row.id,
    nombre: row.name,
    objetivo: Number(row.target_amount),
    ahorrado: Number(row.saved_amount),
    fecha: row.target_date,
    estado: row.status,
  }
}
function mapTransaction(row) {
  return {
    id: row.id,
    accountId: row.account_id,
    categoryId: row.category_id,
    tipo: TX_TYPE_FROM_DB[row.type] || row.type,
    monto: Number(row.amount),
    descripcion: row.description || '',
    fecha: row.transaction_date,
  }
}

function resetFinanzas() {
  state.accounts = []
  state.categories = []
  state.budgets = []
  state.debts = []
  state.goals = []
  state.transactions = []
  state.loading = true
  state.error = ''
}

export async function loadFinanzas() {
  const userId = authState.userId
  if (!userId) return
  state.loading = true
  state.error = ''
  try {
    const [acc, cat, bud, debt, goal, tx] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('categories').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('debts').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('goals').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }),
    ])
    for (const r of [acc, cat, bud, debt, goal, tx]) if (r.error) throw r.error
    state.accounts = acc.data.map(mapAccount)
    state.categories = cat.data.map(mapCategory)
    state.budgets = bud.data.map(mapBudget)
    state.debts = debt.data.map(mapDebt)
    state.goals = goal.data.map(mapGoal)
    state.transactions = tx.data.map(mapTransaction)
  } catch (e) {
    console.error(e)
    state.error = 'No se pudieron cargar tus datos financieros. Intenta recargar la página.'
  } finally {
    state.loading = false
  }
}

authReady.then(() => {
  if (authState.isAuthenticated) loadFinanzas()
})

watch(
  () => authState.isAuthenticated,
  (isAuth) => (isAuth ? loadFinanzas() : resetFinanzas())
)

// ---- Cuentas ----

export async function addCuenta() {
  const userId = authState.userId
  if (!userId) return
  const { data, error } = await supabase
    .from('accounts')
    .insert({ user_id: userId, name: 'Nueva cuenta', type: 'cash', currency: 'CLP', initial_balance: 0 })
    .select()
    .single()
  if (error) return console.error(error)
  state.accounts.push(mapAccount(data))
}

export async function deleteCuenta(id) {
  // account_id en transactions es NOT NULL: no hay a qué desvincularlo, así que
  // se bloquea la eliminación en vez de arriesgar un error de FK a mitad de camino.
  if (state.transactions.some((t) => t.accountId === id)) {
    state.error = 'No puedes eliminar una cuenta con gastos registrados. Borra esos gastos primero.'
    return
  }
  state.accounts = state.accounts.filter((a) => a.id !== id)
  const { error } = await supabase.from('accounts').delete().eq('id', id)
  if (error) console.error(error)
}

const ACCOUNT_COLUMN = { nombre: 'name', tipo: 'type', moneda: 'currency', saldoInicial: 'initial_balance' }

export async function updateCuenta(id, field, value) {
  const row = state.accounts.find((a) => a.id === id)
  if (!row) return
  const val = field === 'saldoInicial' ? Number(value) || 0 : value
  row[field] = val
  const column = ACCOUNT_COLUMN[field] || field
  const { error } = await supabase.from('accounts').update({ [column]: val }).eq('id', id)
  if (error) console.error(error)
}

// ---- Presupuesto (categorías + monto presupuestado del mes en vista) ----

function findBudget(categoryId, month, year) {
  return state.budgets.find((b) => b.categoryId === categoryId && b.month === month && b.year === year)
}

// Vista "aplanada" categoría + su presupuesto del mes/año actualmente en vista
// (mismo shape que usaban las vistas antes de tener budgets reales por mes).
export const presupuestoActual = computed(() =>
  state.categories.map((cat) => {
    const budget = findBudget(cat.id, state.monthIndex + 1, state.year)
    return { id: cat.id, nombre: cat.nombre, tipo: cat.tipo, monto: budget ? budget.monto : 0 }
  })
)

export async function addPresupuesto(tipo) {
  const userId = authState.userId
  if (!userId) return
  const { data: cat, error: catError } = await supabase
    .from('categories')
    .insert({ user_id: userId, name: tipo === 'ingreso' ? 'Nuevo ingreso' : 'Nuevo gasto', type: CATEGORY_TYPE_TO_DB[tipo] })
    .select()
    .single()
  if (catError) return console.error(catError)
  state.categories.push(mapCategory(cat))

  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .insert({ user_id: userId, category_id: cat.id, amount: 0, month: state.monthIndex + 1, year: state.year })
    .select()
    .single()
  if (budgetError) return console.error(budgetError)
  state.budgets.push(mapBudget(budget))
}

export async function deletePresupuesto(id) {
  state.categories = state.categories.filter((c) => c.id !== id)
  state.budgets = state.budgets.filter((b) => b.categoryId !== id)
  state.transactions.forEach((t) => {
    if (t.categoryId === id) t.categoryId = null
  })

  // Borra explícitamente lo que referencia esta categoría antes de borrarla:
  // la FK de budgets.category_id no tiene ON DELETE CASCADE en la base real.
  const { error: budgetError } = await supabase.from('budgets').delete().eq('category_id', id)
  if (budgetError) return console.error(budgetError)

  const { error: txError } = await supabase.from('transactions').update({ category_id: null }).eq('category_id', id)
  if (txError) return console.error(txError)

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) console.error(error)
}

export async function updatePresupuesto(id, field, value) {
  if (field === 'nombre') {
    const cat = state.categories.find((c) => c.id === id)
    if (!cat) return
    cat.nombre = value
    const { error } = await supabase.from('categories').update({ name: value }).eq('id', id)
    if (error) console.error(error)
    return
  }

  // field === 'monto': upsert del presupuesto de esta categoría para el mes en vista.
  const monto = Number(value) || 0
  const month = state.monthIndex + 1
  const year = state.year
  const existing = findBudget(id, month, year)
  if (existing) {
    existing.monto = monto
    const { error } = await supabase.from('budgets').update({ amount: monto }).eq('id', existing.id)
    if (error) console.error(error)
    return
  }
  const userId = authState.userId
  const { data, error } = await supabase
    .from('budgets')
    .insert({ user_id: userId, category_id: id, amount: monto, month, year })
    .select()
    .single()
  if (error) return console.error(error)
  state.budgets.push(mapBudget(data))
}

export function updatePresupuestoMonto(id, val) {
  return updatePresupuesto(id, 'monto', val)
}

// ---- Deudas ----

export async function addDeuda() {
  const userId = authState.userId
  if (!userId) return
  const { data, error } = await supabase
    .from('debts')
    .insert({
      user_id: userId, institution: '', name: 'Nueva deuda',
      balance: 0, interest_rate: 0, minimum_payment: 0, current_payment: 0, status: 'current',
    })
    .select()
    .single()
  if (error) return console.error(error)
  state.debts.push(mapDebt(data))
}

export async function deleteDeuda(id) {
  state.debts = state.debts.filter((d) => d.id !== id)
  const { error } = await supabase.from('debts').delete().eq('id', id)
  if (error) console.error(error)
}

const DEBT_COLUMN = {
  institucion: 'institution', nombre: 'name', saldo: 'balance', tasa: 'interest_rate',
  pagoMin: 'minimum_payment', pagoReal: 'current_payment', diaPago: 'due_day', estado: 'status',
}

export async function updateDeuda(id, field, value) {
  const row = state.debts.find((d) => d.id === id)
  if (!row) return
  const numFields = ['saldo', 'tasa', 'pagoMin', 'pagoReal', 'diaPago']
  const val = numFields.includes(field) ? (value === '' ? null : Number(value) || 0) : value
  row[field] = val
  const column = DEBT_COLUMN[field] || field
  const { error } = await supabase.from('debts').update({ [column]: val }).eq('id', id)
  if (error) console.error(error)
}

// ---- Metas de ahorro ----

export async function addMeta() {
  const userId = authState.userId
  if (!userId) return
  const { data, error } = await supabase
    .from('goals')
    .insert({ user_id: userId, name: 'Nueva meta', target_amount: 0, saved_amount: 0, target_date: todayISO(), status: 'active' })
    .select()
    .single()
  if (error) return console.error(error)
  state.goals.push(mapGoal(data))
}

export async function deleteMeta(id) {
  state.goals = state.goals.filter((m) => m.id !== id)
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) console.error(error)
}

const GOAL_COLUMN = { nombre: 'name', objetivo: 'target_amount', ahorrado: 'saved_amount', fecha: 'target_date', estado: 'status' }

export async function updateMeta(id, field, value) {
  const row = state.goals.find((m) => m.id === id)
  if (!row) return
  const numFields = ['objetivo', 'ahorrado']
  const val = numFields.includes(field) ? Number(value) || 0 : value
  row[field] = val
  const column = GOAL_COLUMN[field] || field
  const { error } = await supabase.from('goals').update({ [column]: val }).eq('id', id)
  if (error) console.error(error)
}

// ---- Gastos diarios (transacciones tipo "expense") ----

export function setGastoForm(field, val) {
  state.gastoForm[field] = val
}

export const gastoCategorias = computed(() => state.categories.filter((c) => c.tipo === 'gasto'))

export async function addGasto() {
  const userId = authState.userId
  const f = state.gastoForm
  if (!userId || !f.monto || Number(f.monto) <= 0 || !f.accountId) return
  const payload = {
    user_id: userId,
    account_id: f.accountId,
    category_id: f.categoryId || null,
    type: 'expense',
    amount: Number(f.monto),
    description: f.desc,
    transaction_date: f.fecha || todayISO(),
  }
  const { data, error } = await supabase.from('transactions').insert(payload).select().single()
  if (error) return console.error(error)
  state.transactions.unshift(mapTransaction(data))
  f.monto = ''
  f.desc = ''
}

export async function deleteGasto(id) {
  state.transactions = state.transactions.filter((t) => t.id !== id)
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) console.error(error)
}

export const totalIngreso = computed(() =>
  presupuestoActual.value.filter((p) => p.tipo === 'ingreso').reduce((a, p) => a + p.monto, 0)
)

export const totalGastoPresupuestado = computed(() =>
  presupuestoActual.value.filter((p) => p.tipo === 'gasto').reduce((a, p) => a + p.monto, 0)
)

export const gastosDelMes = computed(() =>
  state.transactions.filter((t) => {
    if (t.tipo !== 'gasto') return false
    const [y, m] = t.fecha.split('-').map(Number)
    return y === state.year && m - 1 === state.monthIndex
  })
)

export const totalGastoReal = computed(() => gastosDelMes.value.reduce((a, g) => a + g.monto, 0))

export const saldoEstimado = computed(() => totalIngreso.value - totalGastoReal.value)

export const tasaAhorro = computed(() => (totalIngreso.value > 0 ? saldoEstimado.value / totalIngreso.value : 0))

export const deudaTotal = computed(() => state.debts.reduce((a, d) => a + d.saldo, 0))
export const pagoMinTotal = computed(() => state.debts.reduce((a, d) => a + d.pagoMin, 0))
export const pagoRealTotal = computed(() => state.debts.reduce((a, d) => a + d.pagoReal, 0))

export const metaObjetivoTotal = computed(() => state.goals.reduce((a, m) => a + m.objetivo, 0))
export const metaAhorradoTotal = computed(() => state.goals.reduce((a, m) => a + m.ahorrado, 0))

export function gastoRealPorCategoria(categoryId) {
  return gastosDelMes.value.filter((g) => g.categoryId === categoryId).reduce((a, g) => a + g.monto, 0)
}

export const gastoHoy = computed(() =>
  state.transactions.filter((t) => t.tipo === 'gasto' && t.fecha === todayISO()).reduce((a, g) => a + g.monto, 0)
)

// ---- Proyección mensual (mes en vista + próximos 5) ----
// Todo lo que sigue son proyecciones calculadas a partir del estado actual, no
// historial real: aunque el presupuesto ya soporta variar por mes, los meses
// futuros normalmente no tienen presupuesto cargado todavía, así que se
// proyecta con el total del mes en vista como línea constante.

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
  const saldos = state.debts.map((d) => d.saldo)
  return monthsWindow().map((m, i) => {
    if (i > 0) {
      state.debts.forEach((d, idx) => {
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
  return state.transactions
    .filter((t) => {
      if (t.tipo !== 'gasto') return false
      const [y, m] = t.fecha.split('-').map(Number)
      return y === year && m - 1 === monthIndex
    })
    .reduce((a, g) => a + g.monto, 0)
}

// Los ingresos presupuestados de meses pasados sin presupuesto cargado se ven
// como la misma línea constante del mes en vista (mismo criterio que la proyección).
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
// mes (lineal, sin interés).
export const historialDeudas = computed(() => {
  const months = monthsWindowBack()
  const n = months.length
  const saldos = state.debts.map((d) => d.saldo)
  const values = new Array(n)
  values[n - 1] = saldos.reduce((a, s) => a + s, 0)
  for (let i = n - 2; i >= 0; i--) {
    state.debts.forEach((d, idx) => { saldos[idx] += d.pagoReal })
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
