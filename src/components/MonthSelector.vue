<script setup>
import { computed } from 'vue'
import { state, prevMonth, nextMonth } from '../store/finanzas'
import { MONTH_NAMES } from '../utils/format'

const label = computed(() => `${MONTH_NAMES[state.monthIndex]} ${state.year}`)
</script>

<template>
  <div class="month-selector">
    <button type="button" aria-label="Mes anterior" @click="prevMonth">‹</button>
    <span style="font-size: 13px; font-weight: 700; color: var(--ink); min-width: 110px; text-align: center">
      {{ label }}
    </span>
    <button type="button" aria-label="Mes siguiente" @click="nextMonth">›</button>
  </div>
</template>
