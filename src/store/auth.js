import { reactive, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const authState = reactive({
  isAuthenticated: false,
  email: '',
  userId: null,
})

export const displayName = computed(() => {
  const local = authState.email.split('@')[0] || 'Usuario'
  return local.charAt(0).toUpperCase() + local.slice(1)
})

export const avatarLetter = computed(() => displayName.value.charAt(0).toUpperCase())

function applySession(session) {
  authState.isAuthenticated = !!session
  authState.email = session?.user?.email || ''
  authState.userId = session?.user?.id || null
}

// El router espera esta promesa antes de decidir si redirige a /login, para no
// expulsar a un usuario con sesión válida mientras Supabase aún la restaura
// desde el storage local (refresh de página, primera carga, etc).
export const authReady = supabase.auth.getSession().then(({ data }) => {
  applySession(data.session)
})

supabase.auth.onAuthStateChange((_event, session) => {
  applySession(session)
})

const AUTH_ERRORS = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'User already registered': 'Ya existe una cuenta con ese correo.',
  'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión.',
}

const AUTH_ERROR_PATTERNS = [
  [/email address .* is invalid/i, 'Ese correo no es válido para este proyecto.'],
  [/password should be at least/i, 'La contraseña debe tener al menos 6 caracteres.'],
  [/rate limit/i, 'Demasiados intentos. Espera un momento y vuelve a intentar.'],
]

function translateError(message) {
  if (AUTH_ERRORS[message]) return AUTH_ERRORS[message]
  const match = AUTH_ERROR_PATTERNS.find(([pattern]) => pattern.test(message))
  return match ? match[1] : message
}

export async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error ? translateError(error.message) : null }
}

export async function signup(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: translateError(error.message), needsConfirmation: false }
  return { error: null, needsConfirmation: !data.session }
}

export async function logout() {
  await supabase.auth.signOut()
}
