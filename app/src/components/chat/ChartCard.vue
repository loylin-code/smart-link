<template>
  <div v-if="data && data.length > 0" class="chart-card">
    <div v-if="title" class="chart-header">
      <span class="chart-title">{{ title }}</span>
      <div v-if="legend && legend.length > 0" class="chart-legend">
        <span v-for="(item, index) in legend" :key="index" class="legend-item">
          <span class="legend-dot" :style="{ background: colors[index] }"></span>
          {{ item }}
        </span>
      </div>
    </div>
    <div class="chart-body">
      <!-- Bar Chart -->
      <div v-if="type === 'bar'" class="bar-chart">
        <div
          v-for="(value, index) in data"
          :key="index"
          class="bar-item"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="bar-label">{{ labels && labels[index] }}</div>
          <div class="bar-wrapper">
            <div
              class="bar"
              :style="{
                width: `${(value / maxValue) * 100}%`,
                background: colors[index % colors.length]
              }"
            >
              <span class="bar-value">{{ formatValue(value) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Line Chart -->
      <div v-else-if="type === 'line'" class="line-chart">
        <svg viewBox="0 0 400 150" class="line-svg">
          <!-- Grid lines -->
          <g class="grid-lines">
            <line
              v-for="i in 5"
              :key="i"
              x1="40"
              :y1="10 + (i - 1) * 32"
              x2="390"
              :y2="10 + (i - 1) * 32"
              stroke="#e5e7eb"
              stroke-width="1"
            />
          </g>
          <!-- Line path -->
          <path
            :d="linePath"
            fill="none"
            :stroke="colors[0]"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Area fill -->
          <path :d="areaPath" :fill="`${colors[0]}20`" />
          <!-- Data points -->
          <g class="data-points">
            <circle
              v-for="(point, index) in linePoints"
              :key="index"
              :cx="point.x"
              :cy="point.y"
              r="4"
              :fill="colors[0]"
            />
          </g>
        </svg>
        <div v-if="labels && labels.length > 0" class="x-labels">
          <span v-for="(label, index) in labels" :key="index">{{ label }}</span>
        </div>
      </div>

      <!-- Pie Chart -->
      <div v-else-if="type === 'pie'" class="pie-chart">
        <svg viewBox="0 0 200 200" class="pie-svg">
          <g transform="translate(100, 100)">
            <path
              v-for="(segment, index) in pieSegments"
              :key="index"
              :d="segment.path"
              :fill="colors[index % colors.length]"
              class="pie-segment"
              :style="{ animationDelay: `${index * 0.1}s` }"
            />
          </g>
        </svg>
        <div v-if="labels && labels.length > 0" class="pie-legend">
          <div v-for="(item, index) in labels" :key="index" class="pie-legend-item">
            <span class="pie-dot" :style="{ background: colors[index] }"></span>
            <span>{{ item }}</span>
            <span class="pie-value">{{ formatValue(data[index]) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    title?: string
    type: 'bar' | 'line' | 'pie'
    data?: number[]
    labels?: string[]
    legend?: string[]
    colors?: string[]
    unit?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    data: () => [],
    labels: () => [],
    colors: () => ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  })

  const maxValue = computed(() => {
    if (!props.data || props.data.length === 0) return 100
    return Math.max(...props.data) * 1.2
  })

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  // Line chart computed
  const linePoints = computed(() => {
    if (!props.data || props.data.length === 0) return []

    const width = 350
    const height = 120
    const padding = 40
    const max = Math.max(...props.data) || 1

    return props.data.map((value, index) => ({
      x: padding + (index / Math.max(props.data.length - 1, 1)) * width,
      y: 10 + height - (value / max) * height
    }))
  })

  const linePath = computed(() => {
    if (linePoints.value.length === 0) return ''
    return linePoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  })

  const areaPath = computed(() => {
    const points = linePoints.value
    if (points.length === 0) return ''
    const last = points[points.length - 1]
    return `${linePath.value} L ${last.x} 140 L ${points[0].x} 140 Z`
  })

  // Pie chart computed
  const pieSegments = computed(() => {
    if (!props.data || props.data.length === 0) return []

    const total = props.data.reduce((sum, v) => sum + v, 0) || 1
    let currentAngle = -90
    const radius = 80

    return props.data.map((value) => {
      const angle = (value / total) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = Math.cos(startRad) * radius
      const y1 = Math.sin(startRad) * radius
      const x2 = Math.cos(endRad) * radius
      const y2 = Math.sin(endRad) * radius

      const largeArc = angle > 180 ? 1 : 0

      return {
        path: `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
      }
    })
  })

  const emit = defineEmits<{
    (e: 'event', data: { type: string; data: any }): void
  }>()
</script>

<style scoped lang="scss">
  .chart-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    margin: 8px 0;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
  }

  .chart-title {
    font-weight: 600;
    color: #1f2937;
  }

  .chart-legend {
    display: flex;
    gap: 12px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #6b7280;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .chart-body {
    padding: 16px;
  }

  // Bar Chart
  .bar-chart {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bar-item {
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease-out forwards;
    opacity: 0;
  }

  @keyframes slideIn {
    to {
      opacity: 1;
    }
  }

  .bar-label {
    width: 80px;
    font-size: 12px;
    color: #6b7280;
  }

  .bar-wrapper {
    flex: 1;
    height: 24px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
  }

  .bar {
    height: 100%;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 8px;
    transition: width 0.5s ease-out;
  }

  .bar-value {
    font-size: 11px;
    font-weight: 600;
    color: #fff;
  }

  // Line Chart
  .line-chart {
    .line-svg {
      width: 100%;
      height: 150px;
    }

    .x-labels {
      display: flex;
      justify-content: space-between;
      padding: 8px 40px 0;
      font-size: 11px;
      color: #9ca3af;
    }
  }

  // Pie Chart
  .pie-chart {
    display: flex;
    align-items: center;
    gap: 24px;

    .pie-svg {
      width: 160px;
      height: 160px;
    }
  }

  .pie-segment {
    transition: transform 0.2s;
    cursor: pointer;

    &:hover {
      transform: scale(1.05);
    }
  }

  .pie-legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pie-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  .pie-dot {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .pie-value {
    margin-left: auto;
    font-weight: 600;
    color: #1f2937;
  }
</style>
