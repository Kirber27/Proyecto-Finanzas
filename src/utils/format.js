export function fmtCLP(n) {
  const v = Math.round(Number(n) || 0)
  return '$' + v.toLocaleString('es-CL')
}

export const CAT_HUES = {
  'Arriendo/Dividendo': 255,
  'Servicios básicos': 220,
  Alimentación: 145,
  Transporte: 35,
  Salud: 200,
  Educación: 300,
  Entretenimiento: 340,
  Deudas: 25,
  Seguros: 190,
  Otros: 60,
}

export function colorForCategory(name, dark) {
  const hue = CAT_HUES[name] ?? 260
  return dark ? `oklch(68% 0.13 ${hue})` : `oklch(56% 0.14 ${hue})`
}

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const MONTH_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

export function todayISO() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
