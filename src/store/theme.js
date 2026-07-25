import { reactive, watch } from 'vue'

const STORAGE_KEY = 'finanzas.theme'

function initialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const themeState = reactive({
  theme: initialTheme(),
})

export function toggleTheme() {
  themeState.theme = themeState.theme === 'light' ? 'dark' : 'light'
}

watch(
  () => themeState.theme,
  (theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    document.documentElement.setAttribute('data-theme', theme)
  },
  { immediate: true }
)
