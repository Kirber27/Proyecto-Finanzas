import { reactive } from 'vue'

const STORAGE_KEY = 'finanzas.auth.email'

export const authState = reactive({
  isAuthenticated: !!localStorage.getItem(STORAGE_KEY),
  email: localStorage.getItem(STORAGE_KEY) || '',
})

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
