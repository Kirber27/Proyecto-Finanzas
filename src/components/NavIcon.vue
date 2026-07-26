<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [String, Number], default: 20 },
})
</script>

<template>
  <svg
    v-if="name === 'resumen'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
  ><line x1="4" y1="20" x2="4" y2="12" /><line x1="12" y1="20" x2="12" y2="6" /><line x1="20" y1="20" x2="20" y2="14" /></svg>

  <svg
    v-else-if="name === 'presupuesto'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  ><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M16 13h.01" /><path d="M3 10h18" /></svg>

  <svg
    v-else-if="name === 'deudas'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  ><rect x="3" y="6" width="18" height="12" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>

  <svg
    v-else-if="name === 'metas'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  ><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.8" fill="currentColor" /></svg>

  <svg
    v-else-if="name === 'gastos'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  ><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /></svg>

  <svg
    v-else-if="name === 'cuentas'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  ><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3H5" /><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z" /><circle cx="16" cy="14" r="1.5" /></svg>
</template>
