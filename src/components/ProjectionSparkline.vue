<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { fmtCLP } from '../utils/format'

const props = defineProps({
  points: { type: Array, required: true }, // [{ month, label, value, projected }]
  color: { type: String, default: 'var(--accent)' },
  formatter: { type: Function, default: fmtCLP },
  projectedLabel: { type: String, default: 'proyectado' },
})

const W = 240
const H = 56
const PAD_X = 10
const PAD_Y = 10

const coords = computed(() => {
  const values = props.points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const n = props.points.length

  return props.points.map((p, i) => {
    const x = n > 1 ? PAD_X + (i / (n - 1)) * (W - PAD_X * 2) : W / 2
    const y = range > 0 ? H - PAD_Y - ((p.value - min) / range) * (H - PAD_Y * 2) : H / 2
    return { x, y, xPct: (x / W) * 100, yPct: (y / H) * 100, ...p }
  })
})

const linePath = computed(() =>
  coords.value.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
)

const areaPath = computed(() => {
  if (!coords.value.length) return ''
  const first = coords.value[0]
  const last = coords.value[coords.value.length - 1]
  return `${linePath.value} L${last.x.toFixed(1)},${H} L${first.x.toFixed(1)},${H} Z`
})

const summary = computed(() =>
  props.points.map((p) => `${p.label}: ${props.formatter(p.value)}${p.projected ? ` (${props.projectedLabel})` : ''}`).join('. ')
)

const activeIndex = ref(null)
const rootEl = ref(null)

function toggle(i) {
  activeIndex.value = activeIndex.value === i ? null : i
}

function onDocClick(e) {
  if (rootEl.value && !rootEl.value.contains(e.target)) activeIndex.value = null
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

const tooltipLeft = computed(() => {
  if (activeIndex.value === null) return '50%'
  return `${Math.min(Math.max(coords.value[activeIndex.value].xPct, 16), 84)}%`
})
const activePoint = computed(() => (activeIndex.value === null ? null : coords.value[activeIndex.value]))
</script>

<template>
  <div ref="rootEl">
    <div style="position: relative">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="none"
        style="width: 100%; height: 52px; display: block"
        role="img"
        :aria-label="summary"
      >
        <path :d="areaPath" :fill="color" opacity="0.1" stroke="none" />
        <path :d="linePath" fill="none" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <g v-for="(c, i) in coords" :key="i">
          <circle v-if="!c.projected" :cx="c.x" :cy="c.y" r="6" fill="var(--card)" />
          <circle
            :cx="c.x"
            :cy="c.y"
            :r="c.projected ? 3 : 4"
            :fill="c.projected ? 'var(--card)' : color"
            :stroke="color"
            :stroke-width="c.projected ? 1.5 : 0"
          />
          <circle v-if="activeIndex === i" :cx="c.x" :cy="c.y" r="8" fill="none" :stroke="color" stroke-width="1.5" opacity="0.55" />
        </g>
      </svg>

      <button
        v-for="(c, i) in coords"
        :key="'hit-' + i"
        type="button"
        class="spark-hit"
        :style="{ left: `${c.xPct}%`, top: `${c.yPct}%` }"
        :aria-label="`${c.label}: ${formatter(c.value)}${c.projected ? ` (${projectedLabel})` : ''}`"
        :aria-pressed="activeIndex === i"
        @click.stop="toggle(i)"
      ></button>

      <div v-if="activePoint" class="spark-tooltip" :style="{ left: tooltipLeft }">
        <strong>{{ formatter(activePoint.value) }}</strong>
        <span>{{ activePoint.label }}{{ activePoint.projected ? ` · ${projectedLabel}` : '' }}</span>
      </div>
    </div>

    <div class="spark-axis">
      <span v-for="(c, i) in coords" :key="'axis-' + i" :style="{ left: `${c.xPct}%` }">{{ c.month }}</span>
    </div>
  </div>
</template>

<style scoped>
.spark-hit {
  position: absolute;
  width: 22px;
  height: 22px;
  margin-left: -11px;
  margin-top: -11px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}
.spark-axis {
  position: relative;
  height: 12px;
  margin-top: 4px;
}
.spark-axis span {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: 600;
  color: var(--ink-faint);
  white-space: nowrap;
}
.spark-tooltip {
  position: absolute;
  bottom: 100%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  background: var(--ink);
  color: var(--bg);
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  white-space: nowrap;
  box-shadow: var(--shadow-card);
  z-index: 5;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.spark-tooltip strong {
  font-size: 12.5px;
  font-weight: 800;
  line-height: 1.3;
}
.spark-tooltip span {
  font-size: 9.5px;
  opacity: 0.75;
}
</style>
