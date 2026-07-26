<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '../components/ThemeToggle.vue'
import { login, signup } from '../store/auth'

const router = useRouter()

const mode = ref('signin') // 'signin' | 'signup'
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const remember = ref(false)
const submitted = ref(false)
const loading = ref(false)
const formError = ref('')
const infoMessage = ref('')

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const passwordValid = computed(() => password.value.length >= 6)
const emailError = computed(() => submitted.value && !emailValid.value)
const passwordError = computed(() => submitted.value && !passwordValid.value)

const isSignup = computed(() => mode.value === 'signup')
const submitLabel = computed(() => {
  if (loading.value) return isSignup.value ? 'Creando cuenta…' : 'Ingresando…'
  return isSignup.value ? 'Crear cuenta' : 'Iniciar sesión'
})

async function onSubmit() {
  submitted.value = true
  formError.value = ''
  infoMessage.value = ''
  if (!emailValid.value || !passwordValid.value) return

  loading.value = true
  const result = isSignup.value ? await signup(email.value, password.value) : await login(email.value, password.value)
  loading.value = false

  if (result.error) {
    formError.value = result.error
    return
  }
  if (isSignup.value && result.needsConfirmation) {
    infoMessage.value = 'Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.'
    mode.value = 'signin'
    submitted.value = false
    return
  }
  router.push({ name: 'resumen' })
}

function toggleMode() {
  mode.value = isSignup.value ? 'signin' : 'signup'
  formError.value = ''
  infoMessage.value = ''
  submitted.value = false
}
</script>

<template>
  <div
    class="d-flex align-items-center justify-content-center"
    style="min-height: 100vh; padding: 20px; background: var(--canvas-bg)"
  >
    <div
      class="card-fx login-grid"
      style="
        width: 1040px;
        max-width: 100%;
        border-radius: 24px;
        box-shadow: var(--shadow-frame);
        overflow: hidden;
        display: grid;
        position: relative;
      "
    >
      <div
        class="d-none d-md-flex flex-column justify-content-between"
        style="
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          padding: 48px;
          color: #fff;
          position: relative;
          overflow: hidden;
        "
      >
        <div class="login-brand-circle" style="width: 320px; height: 320px; background: rgba(255,255,255,0.08); top: -100px; right: -100px"></div>
        <div class="login-brand-circle" style="width: 220px; height: 220px; background: rgba(255,255,255,0.06); bottom: -60px; left: -60px"></div>
        <div style="position: relative; z-index: 1">
          <div
            style="width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 19px"
          >
            F
          </div>
          <h1 style="font-size: 28px; font-weight: 800; margin: 24px 0 8px">Finanzas</h1>
          <p style="font-size: 14.5px; line-height: 1.6; opacity: 0.85; max-width: 320px; margin: 0">
            Tu sistema financiero personal: presupuesto, deudas, metas y gastos en un solo lugar.
          </p>
        </div>
        <p style="position: relative; z-index: 1; font-size: 12px; opacity: 0.7; margin: 0">© 2026 Finanzas</p>
      </div>

      <div style="padding: 52px 40px; display: flex; flex-direction: column; justify-content: center; position: relative">
        <div style="position: absolute; top: 22px; right: 24px">
          <ThemeToggle with-label />
        </div>

        <h2 style="font-size: 22px; font-weight: 700; color: var(--ink); margin: 0 0 6px">
          {{ isSignup ? 'Crea tu cuenta' : 'Bienvenido de vuelta' }}
        </h2>
        <p style="font-size: 14px; color: var(--ink-soft); margin: 0 0 26px">
          {{ isSignup ? 'Ingresa tus datos para registrarte' : 'Ingresa tus datos para continuar' }}
        </p>

        <p v-if="infoMessage" style="color: var(--good); font-size: 13px; margin: 0 0 16px">{{ infoMessage }}</p>
        <p v-if="formError" style="color: var(--bad); font-size: 13px; margin: 0 0 16px">{{ formError }}</p>

        <form novalidate @submit.prevent="onSubmit">
          <label class="field-label" for="login-email">Correo electrónico</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            class="field-input field-input-lg"
            :disabled="loading"
            :style="{ marginTop: '6px', marginBottom: emailError ? '4px' : '16px', borderColor: emailError ? 'var(--bad)' : undefined }"
          />
          <p v-if="emailError" style="color: var(--bad); font-size: 12px; margin: 0 0 12px">Ingresa un correo electrónico válido.</p>

          <label class="field-label" for="login-password">Contraseña</label>
          <div style="position: relative; margin: 6px 0 4px">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="field-input field-input-lg"
              style="padding-right: 52px"
              :disabled="loading"
              :style="{ borderColor: passwordError ? 'var(--bad)' : undefined }"
            />
            <button
              type="button"
              class="btn-fx-link"
              style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 12px"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <p v-if="passwordError" style="color: var(--bad); font-size: 12px; margin: 0 0 10px">
            La contraseña debe tener al menos 6 caracteres.
          </p>

          <div v-if="!isSignup" class="d-flex justify-content-between align-items-center" style="margin: 6px 0 22px">
            <label class="d-flex align-items-center gap-2" style="font-size: 13px; color: var(--ink-soft)">
              <input v-model="remember" type="checkbox" style="accent-color: var(--accent)" /> Recuérdame
            </label>
            <a href="#" style="font-size: 13px; color: var(--accent); font-weight: 600; text-decoration: none">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" class="btn-fx-primary w-100" style="font-size: 15px" :disabled="loading" :style="isSignup ? { marginTop: '22px' } : undefined">
            {{ submitLabel }}
          </button>
        </form>

        <div class="d-flex align-items-center gap-3" style="margin: 22px 0">
          <div style="flex: 1; height: 1px; background: var(--border)"></div>
          <span style="font-size: 12px; color: var(--ink-faint)">o</span>
          <div style="flex: 1; height: 1px; background: var(--border)"></div>
        </div>

        <button type="button" class="btn-fx-outline w-100" :disabled="loading" @click="toggleMode">
          {{ isSignup ? 'Ya tengo cuenta, iniciar sesión' : 'Crear cuenta nueva' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-grid {
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .login-grid {
    grid-template-columns: 1fr 1fr;
    height: 660px;
    max-height: 85vh;
  }
}
</style>
