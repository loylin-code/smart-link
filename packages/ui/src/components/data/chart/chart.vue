<template>
  <div class="sl-chart" :class="{ 'is-smooth': smooth }">
    <div v-if="title" class="sl-chart__header">
      <h3 class="sl-chart__title">{{ title }}</h3>
    </div>

    <div class="sl-chart__content">
      <!-- 折线图 -->
      <svg
        v-if="chartType === 'line'"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        class="sl-chart__svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- 区域填充 -->
        <path
          v-if="computedLinePath"
          :d="computedAreaPath"
          :stroke="computedColors[0]"
          :fill="`${computedColors[0]}20`"
          fill-rule="evenodd"
        />
        <!-- 折线路径 -->
        <path
          v-if="computedLinePath"
          :d="computedLinePath"
          :stroke="computedColors[0]"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!-- 数据点 -->
        <circle
          v-for="(point, index) in dataPoints"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          r="4"
          :fill="computedColors[0]"
          :stroke="bgColor"
          stroke-width="2"
        />
        <!-- X 轴标签 -->
        <text
          v-for="(label, index) in visibleLabels"
          :key="index"
          :x="labelXPosition(index)"
          :y="svgHeight - 10"
          text-anchor="middle"
          font-size="10"
          :fill="textColor"
        >
          {{ label }}
        </text>
      </svg>

      <!-- 柱状图 -->
      <div v-else-if="chartType === 'bar'" class="sl-chart__bar-container">
        <div v-for="(bar, index) in barData" :key="index" class="sl-chart__bar-item">
          <div class="sl-chart__bar-label">{{ bar.label }}</div>
          <div class="sl-chart__bar-wrapper">
            <div
              class="sl-chart__bar"
              :style="{
                width: `${bar.width}%`,
                backgroundColor: computedColors[index % computedColors.length]
              }"
            >
              <span class="sl-chart__bar-value">{{ formatValue(bar.value) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 饼图 -->
      <div v-else-if="chartType === 'pie'" class="sl-chart__pie-container">
        <svg
          :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
          class="sl-chart__svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            v-for="(segment, index) in pieSegments"
            :key="index"
            :d="segment.path"
            :fill="computedColors[index % computedColors.length]"
          />
        </svg>
        <div v-if="showLegend" class="sl-chart__legend">
          <div v-for="(item, index) in pieData" :key="index" class="sl-chart__legend-item">
            <span
              class="sl-chart__legend-dot"
              :style="{ backgroundColor: computedColors[index % computedColors.length] }"
            ></span>
            <span class="sl-chart__legend-label">{{ item.label }}</span>
            <span class="sl-chart__legend-value">{{ formatValue(item.value) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div v-if="showLegend && chartType !== 'pie'" class="sl-chart__legend">
      <div
        v-for="(dataset, index) in dataSource?.datasets"
        :key="index"
        class="sl-chart__legend-item"
      >
        <span
          class="sl-chart__legend-dot"
          :style="{ backgroundColor: computedColors[index % computedColors.length] }"
        ></span>
        <span class="sl-chart__legend-label">{{ dataset.label || `数据${index + 1}` }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface DataSet {
    label?: string
    data: number[]
  }

  interface ChartData {
    labels?: string[]
    datasets?: DataSet[]
    values?: number[]
  }

  interface Props {
    chartType: 'line' | 'bar' | 'pie'
    dataSource: ChartData
    title?: string
    showLegend?: boolean
    smooth?: boolean
    colors?: string[]
  }

  const props = withDefaults(defineProps<Props>(), {
    showLegend: true,
    smooth: true
  })

  const svgWidth = 400
  const svgHeight = 250
  const padding = { top: 20, right: 20, bottom: 30, left: 20 }
  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom - padding.bottom

  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  const bgColor = '#ffffff'
  const textColor = '#6b7280'

  const computedColors = computed(() => props.colors || defaultColors)

  // 获取数据值
  const dataValues = computed(() => {
    if (props.dataSource?.datasets?.[0]?.data) {
      return props.dataSource.datasets[0].data
    }
    return props.dataSource?.values || []
  })

  // 获取标签
  const labels = computed(() => props.dataSource?.labels || [])

  // 计算可见标签 (避免重叠)
  const visibleLabels = computed(() => {
    const allLabels = labels.value
    if (allLabels.length <= 6) return allLabels
    const step = Math.ceil(allLabels.length / 6)
    return allLabels.filter((_, i) => i % step === 0)
  })

  // 计算极值
  const { minVal, maxVal } = computed(() => {
    const values = dataValues.value
    if (values.length === 0) return { minVal: 0, maxVal: 0 }
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1 || 1
    return { minVal: min - padding, maxVal: max + padding }
  })

  // 折线图数据点
  const dataPoints = computed(() => {
    const values = dataValues.value
    const step = chartWidth / (values.length - 1 || 1)
    const range = maxVal.value - minVal.value || 1

    return values.map((val, i) => ({
      x: padding.left + (values.length === 1 ? chartWidth / 2 : i * step),
      y: padding.top + chartHeight - ((val - minVal.value) / range) * chartHeight
    }))
  })

  // 折线线路径
  const computedLinePath = computed(() => {
    const points = dataPoints.value
    if (points.length === 0) return ''

    if (props.smooth && points.length > 2) {
      // 平滑曲线
      let path = `M ${points[0].x} ${points[0].y}`
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const cp1x = prev.x + (curr.x - prev.x) / 2
        const cp1y = prev.y
        const cp2x = prev.x + (curr.x - prev.x) / 2
        const cp2y = curr.y
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
      }
      return path
    }

    // 折线
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  })

  // 区域填充路径
  const computedAreaPath = computed(() => {
    const points = dataPoints.value
    if (points.length === 0) return ''

    const linePath = computedLinePath.value
    const firstPoint = points[0]
    const lastPoint = points[points.length - 1]
    const baseline = padding.top + chartHeight

    return `${linePath} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`
  })

  // X 轴标签位置
  const labelXPosition = (index: number) => {
    const step = labels.value.length <= 6 ? 1 : Math.ceil(labels.value.length / 6)
    return padding.left + index * step * (chartWidth / (labels.value.length - 1 || 1))
  }

  // 柱状图数据
  const barData = computed(() => {
    const values = dataValues.value
    const _max = maxVal.value || 1

    return values.map((val, i) => ({
      label: labels.value[i] || `${i + 1}`,
      value: val,
      width: (val / _max) * 100
    }))
  })

  // 饼图数据
  const pieData = computed(() => {
    if (props.dataSource?.datasets?.[0]?.data) {
      return props.dataSource.datasets[0].data.map((val, i) => ({
        label: props.dataSource.labels?.[i] || `数据${i + 1}`,
        value: val
      }))
    }
    const values = props.dataSource?.values || []
    return values.map((val, i) => ({
      label: props.dataSource.labels?.[i] || `数据${i + 1}`,
      value: val
    }))
  })

  // 饼图分段路径
  const pieSegments = computed(() => {
    const data = pieData.value
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1
    const centerX = svgWidth / 2
    const centerY = svgHeight / 2 - 10
    const radius = Math.min(centerX, centerY) - 40

    let currentAngle = -Math.PI / 2
    const segments: { path: string }[] = []

    data.forEach((item) => {
      const angle = (item.value / total) * Math.PI * 2
      const endAngle = currentAngle + angle

      const x1 = centerX + radius * Math.cos(currentAngle)
      const y1 = centerY + radius * Math.sin(currentAngle)
      const x2 = centerX + radius * Math.cos(endAngle)
      const y2 = centerY + radius * Math.sin(endAngle)

      const largeArc = angle > Math.PI ? 1 : 0

      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
      segments.push({ path })

      currentAngle = endAngle
    })

    return segments
  })

  // 格式化数值
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }
</script>

<style scoped lang="scss">
  .sl-chart {
    background: #ffffff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &__header {
      margin-bottom: 16px;
    }

    &__title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    &__content {
      position: relative;
      min-height: 200px;
    }

    &__svg {
      width: 100%;
      height: auto;
      display: block;
    }

    // 柱状图样式
    &__bar-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }

    &__bar-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    &__bar-label {
      width: 60px;
      font-size: 12px;
      color: #6b7280;
      text-align: right;
      flex-shrink: 0;
    }

    &__bar-wrapper {
      flex: 1;
      background: #f3f4f6;
      border-radius: 4px;
      overflow: hidden;
    }

    &__bar {
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
      min-width: 40px;
      transition: width 0.3s ease;
    }

    &__bar-value {
      font-size: 12px;
      color: #ffffff;
      font-weight: 500;
    }

    // 饼图样式
    &__pie-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    // 图例样式
    &__legend {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    &__legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #6b7280;
    }

    &__legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    &__legend-label {
      flex-shrink: 0;
    }

    &__legend-value {
      font-weight: 500;
      color: #1f2937;
      margin-left: 4px;
    }

    // 平滑效果
    &.is-smooth {
      .sl-chart__svg path {
        transition: d 0.3s ease;
      }
    }
  }
</style>
