import { reactive, computed } from 'vue'

const STORAGE_KEY = 'finanzas.auth.email'

export const authState = reactive({
  isAuthenticated: !!localStorage.getItem(STORAGE_KEY),
  email: localStorage.getItem(STORAGE_KEY) || '',
})

export const displayName = computed(() => {
  const local = authState.email.split('@')[0] || 'Usuario'
  return local.charAt(0).toUpperCase() + local.slice(1)
})

export const avatarLetter = computed(() => displayName.value.charAt(0).toUpperCase())

export function login(email) {
  authState.isAuthenticated = true
  authState.email = email
  localStorage.setItem(STORAGE_KEY, email)
}

export function logout() {
  authState.isAuthenticated = false
  authState.email = ''
  localStorage.removeItem(STORAGE_KEY)
}
