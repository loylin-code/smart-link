<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart } from '@antv/g2'
import type { VisConfig } from '../../types'

interface Props {
  data: VisConfig
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light'
})

// Refs
const chartContainerRef = ref<HTMLElement | null>(null)
const chartInstance = ref<Chart | null>(null)

// Computed
const chartTitle = computed(() => props.data.title ?? 'Chart Detail')

const chartType = computed(() => props.data.type)

const dataCount = computed(() => props.data.data.length)

// Calculate statistics summary
const statistics = computed(() => {
  const data = props.data.data
  if (!data.length) {
    return null
  }

  const yField = props.data.yField ?? props.data.valueField ?? 'value'
  const values = data.map((item: Record<string, unknown>) => {
    const val = item[yField] as number | undefined
    return typeof val === 'number' ? val : 0
  })

  const sum = values.reduce((a: number, b: number) => a + b, 0)
  const avg = sum / values.length
  const max = Math.max(...values)
  const min = Math.min(...values)

  return {
    sum,
    avg: Math.round(avg * 100) / 100,
    max,
    min,
    count: values.length
  }
})

// Table columns based on data structure
const tableColumns = computed(() => {
  if (!props.data.data.length) {
    return []
  }

  const firstItem = props.data.data[0]
  return Object.keys(firstItem).map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1)
  }))
})

// Initialize chart
const initChart = async () => {
  await nextTick()

  if (!chartContainerRef.value) {
    console.log('[ChartDetail] chartContainerRef not ready, skipping init')
    return
  }

  // Check if container has valid dimensions
  const container = chartContainerRef.value
  if (container.clientWidth === 0) {
    console.log('[ChartDetail] container has no width, setting default')
    container.style.width = '100%'
    container.style.minWidth = '400px'
  }

  // Destroy existing chart
  if (chartInstance.value) {
    try {
      chartInstance.value.destroy()
    } catch (e) {
      console.warn('[ChartDetail] Error destroying chart:', e)
    }
    chartInstance.value = null
  }

  const theme = props.theme === 'dark' ? 'classicDark' : 'classic'
  const config = props.data

  try {
    // Create chart based on type
    chartInstance.value = new Chart({
      container,
      width: container.clientWidth || 400,
      height: 500,
      theme,
      autoFit: true
    })

    // ... rest of chart configuration
  } catch (e) {
    console.error('[ChartDetail] Error creating chart:', e)
    return
  }

  // Common field mappings
  const xField = config.xField ?? 'category'
  const yField = config.yField ?? 'value'
  const categoryField = config.categoryField ?? config.colorField ?? undefined
  const valueField = config.yField ?? config.valueField ?? 'value'

  try {
    // Render chart by type
    switch (config.type) {
      case 'line':
        chartInstance.value
          .line()
          .data(config.data)
          .encode('x', xField)
          .encode('y', yField)
          .style('smooth', config.smooth ?? false)
          .style('lineWidth', 2)

        chartInstance.value
          .point()
          .data(config.data)
          .encode('x', xField)
          .encode('y', yField)
          .style('r', 3)

        if (categoryField) {
          chartInstance.value.line().encode('color', categoryField).legend(true)
          chartInstance.value.point().encode('color', categoryField)
        }
        break

      case 'pie':
        chartInstance.value.coordinate({ type: 'polar', innerRadius: config.innerRadius ?? 0 })
        chartInstance.value
          .interval()
          .data(config.data)
          .encode('y', valueField)
          .encode('color', categoryField ?? config.angleField ?? 'category')
          .transform({ type: 'stackY' })
          .legend(true)
          .style('radius', 10)
        break

      case 'bar':
        const barInterval = chartInstance.value
          .interval()
          .data(config.data)
          .encode('x', xField)
          .encode('y', yField)
          .style('radius', 4)

        if (categoryField) {
          barInterval.encode('color', categoryField).legend(true)
        }

        if (config.stack) {
          barInterval.transform({ type: 'stackY' })
        }
        break

      default:
        // Default to bar
        chartInstance.value
          .interval()
          .data(config.data)
          .encode('x', xField)
          .encode('y', yField)
    }

    chartInstance.value.render()
    console.log('[ChartDetail] Chart initialized successfully:', config.type)
  } catch (e) {
    console.error('[ChartDetail] Error rendering chart:', e)
  }
}

// Watch for data changes - flush: 'post' ensures DOM is ready
watch(
  () => props.data,
  () => {
    initChart()
  },
  { deep: true, flush: 'post' }
)

// Watch for theme changes
watch(
  () => props.theme,
  () => {
    initChart()
  },
  { flush: 'post' }
)

// Lifecycle
onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
})

// Export image
const exportImage = () => {
  if (chartInstance.value) {
    const context = chartInstance.value.getContext()
    const nativeCanvas = context?.canvas?.getConfig?.()?.canvas as unknown as HTMLCanvasElement | undefined
    if (nativeCanvas) {
      const dataUrl = nativeCanvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${chartTitle.value}.png`
      link.href = dataUrl
      link.click()
    }
  }
}

defineExpose({
  exportImage,
  refresh: initChart
})
</script>

<template>
  <div class="chart-detail" :class="`theme-${theme}`">
    <!-- Header -->
    <header class="chart-detail-header">
      <h2 class="chart-title">{{ chartTitle }}</h2>
      <div class="chart-meta">
        <span class="chart-type-badge">{{ chartType }}</span>
        <span class="data-count">{{ dataCount }} items</span>
      </div>
      <button class="export-btn" @click="exportImage">
        Export PNG
      </button>
    </header>

    <!-- Large Chart -->
    <section class="chart-section">
      <div ref="chartContainerRef" class="chart-container"></div>
    </section>

    <!-- Statistics Summary -->
    <section v-if="statistics" class="statistics-section">
      <h3 class="section-title">Statistics Summary</h3>
      <div class="statistics-grid">
        <div class="stat-item">
          <span class="stat-label">Sum</span>
          <span class="stat-value">{{ statistics.sum }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Average</span>
          <span class="stat-value">{{ statistics.avg }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Max</span>
          <span class="stat-value">{{ statistics.max }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Min</span>
          <span class="stat-value">{{ statistics.min }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Count</span>
          <span class="stat-value">{{ statistics.count }}</span>
        </div>
      </div>
    </section>

    <!-- Data Table -->
    <section class="data-table-section">
      <h3 class="section-title">Data Table</h3>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="col in tableColumns" :key="col.key">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in data.data" :key="rowIndex">
              <td v-for="col in tableColumns" :key="col.key">
                {{ row[col.key] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.chart-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
}

.chart-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.chart-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.chart-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-type-badge {
  padding: 4px 12px;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.data-count {
  color: #6b7280;
  font-size: 14px;
}

.export-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.export-btn:hover {
  background: #2563eb;
}

.chart-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 500px;
  background: #f9fafb;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.statistics-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.data-table-section {
  overflow: hidden;
}

.data-table-wrapper {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  padding: 12px 16px;
  background: #f9fafb;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 10px 16px;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: #f9fafb;
}

/* Dark theme */
.chart-detail.theme-dark {
  background: #1f2937;
}

.theme-dark .chart-detail-header {
  border-bottom-color: #374151;
}

.theme-dark .chart-title {
  color: #f9fafb;
}

.theme-dark .chart-type-badge {
  background: #1e3a5f;
  color: #60a5fa;
}

.theme-dark .data-count {
  color: #9ca3af;
}

.theme-dark .chart-section {
  border-color: #374151;
}

.theme-dark .chart-container {
  background: #111827;
}

.theme-dark .section-title {
  color: #e5e7eb;
}

.theme-dark .statistics-section {
  background: #111827;
}

.theme-dark .stat-label {
  color: #9ca3af;
}

.theme-dark .stat-value {
  color: #f9fafb;
}

.theme-dark .data-table-wrapper {
  border-color: #374151;
}

.theme-dark .data-table th {
  background: #374151;
  color: #e5e7eb;
  border-bottom-color: #4b5563;
}

.theme-dark .data-table td {
  border-bottom-color: #374151;
  color: #f9fafb;
}

.theme-dark .data-table tr:hover td {
  background: #374151;
}
</style>