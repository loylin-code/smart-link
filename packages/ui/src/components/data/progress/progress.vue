<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    percentage: number
    status?: 'success' | 'warning' | 'error'
    type?: 'line' | 'circle'
    showText?: boolean
    strokeWidth?: number
    size?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    status: undefined,
    type: 'line',
    showText: true,
    strokeWidth: 6,
    size: 120
  })

  const clampedPercentage = computed(() => {
    return Math.min(100, Math.max(0, props.percentage))
  })

  const statusColor = computed(() => {
    const colors: Record<string, string> = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
    return props.status ? colors[props.status] : undefined
  })

  const lineStyle = computed(() => {
    return {
      width: `${clampedPercentage.value}%`,
      backgroundColor: statusColor.value
    }
  })

  const circleRadius = computed(() => {
    return (props.size - props.strokeWidth) / 2
  })

  const circleCircumference = computed(() => {
    return 2 * Math.PI * circleRadius.value
  })

  const circleStrokeDashoffset = computed(() => {
    return circleCircumference.value - (clampedPercentage.value / 100) * circleCircumference.value
  })

  const circleStyle = computed(() => {
    return {
      width: `${props.size}px`,
      height: `${props.size}px`
    }
  })

  const svgStyle = computed(() => ({
    transform: 'rotate(-90deg)',
    transformOrigin: '50% 50%'
  }))
</script>

<template>
  <div v-if="type === 'line'" class="sl-progress sl-progress--line">
    <div class="sl-progress__bar">
      <div class="sl-progress__bar-bg">
        <div class="sl-progress__bar-fill" :style="lineStyle" />
      </div>
    </div>
    <span v-if="showText" class="sl-progress__text">{{ clampedPercentage }}%</span>
  </div>

  <div v-else-if="type === 'circle'" class="sl-progress sl-progress--circle" :style="circleStyle">
    <svg viewBox="0 0 100 100" :style="svgStyle">
      <circle
        class="sl-progress__circle-bg"
        :cx="50"
        :cy="50"
        :r="(circleRadius / size) * 50"
        :stroke-width="(strokeWidth / size) * 100"
        fill="none"
      />
      <circle
        class="sl-progress__circle-fill"
        :cx="50"
        :cy="50"
        :r="(circleRadius / size) * 50"
        :stroke-width="(strokeWidth / size) * 100"
        :stroke-dasharray="(circleCircumference / size) * 100"
        :stroke-dashoffset="(circleStrokeDashoffset / size) * 100"
        :stroke="statusColor"
        fill="none"
        stroke-linecap="round"
      />
    </svg>
    <span v-if="showText" class="sl-progress__text">{{ clampedPercentage }}%</span>
  </div>
</template>

<style scoped>
  .sl-progress {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sl-progress--line {
    flex-direction: row;
  }

  .sl-progress--circle {
    flex-direction: column;
    justify-content: center;
    position: relative;
  }

  .sl-progress__bar {
    flex: 1;
  }

  .sl-progress__bar-bg {
    width: 100%;
    height: v-bind('`${strokeWidth}px`');
    background-color: #e5e7eb;
    border-radius: v-bind('`${strokeWidth / 2}px`');
    overflow: hidden;
  }

  .sl-progress__bar-fill {
    height: 100%;
    background-color: #3b82f6;
    border-radius: v-bind('`${strokeWidth / 2}px`');
    transition: width 0.3s ease;
  }

  .sl-progress__circle-bg {
    stroke: #e5e7eb;
  }

  .sl-progress__circle-fill {
    transition: stroke-dashoffset 0.3s ease;
  }

  .sl-progress__text {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    min-width: 45px;
    text-align: center;
  }

  .sl-progress--circle .sl-progress__text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
