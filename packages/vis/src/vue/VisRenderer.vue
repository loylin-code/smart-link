<script setup lang="ts">
  import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
  import type { VisConfig, StreamingConfig, ChartType } from '../types'
  import { SmartVis } from '../core/SmartVis'
  import { StreamingDetector } from '../syntax/streaming-detector'
  import ChartPlaceholder from './ChartPlaceholder.vue'

  interface Props {
    content: string
    streaming?: boolean
    width?: number
    height?: number
    theme?: 'light' | 'dark'
  }

  const props = withDefaults(defineProps<Props>(), {
    streaming: false,
    width: undefined,
    height: undefined,
    theme: 'light'
  })

  const emit = defineEmits<{
    (e: 'chart-click', config: VisConfig): void
    (e: 'chart-ready', config: VisConfig): void
    (e: 'chart-error', error: string): void
    (e: 'state-change', state: StreamingConfig['state']): void
  }>()

  // State
  const containerRef = ref<HTMLElement | null>(null)
  const smartVisRef = ref<SmartVis | null>(null)
  const streamingDetector = ref<StreamingDetector | null>(null)
  const streamingState = ref<StreamingConfig>({
    state: 'idle',
    detectedType: null,
    partialConfig: null,
    progress: 0
  })
  const extractedConfig = ref<VisConfig | null>(null)
  const renderError = ref<string | null>(null)

  // Computed
  const currentState = computed(() => streamingState.value.state)
  const detectedType = computed(() => streamingState.value.detectedType)
  const progress = computed(() => streamingState.value.progress)
  const chartTitle = computed(() => extractedConfig.value?.title || streamingState.value.partialConfig?.title || '')

  const showPlaceholder = computed(() => {
    return props.streaming && currentState.value !== 'idle' && currentState.value !== 'ready'
  })

  const showChart = computed(() => {
    return currentState.value === 'ready' && extractedConfig.value !== null
  })

  const hasError = computed(() => {
    return currentState.value === 'error' || renderError.value !== null
  })

  // Extract chart config from content
  const extractChartConfig = (content: string): VisConfig | null => {
    // Look for chart-json code blocks
    const codeBlockRegex = /```(?:chart-json|vis|chart)\s*\n([\s\S]*?)\n```/
    const match = codeBlockRegex.exec(content)

    if (match) {
      const jsonContent = match[1].trim()
      try {
        const parsed = JSON.parse(jsonContent) as VisConfig
        if (parsed.type && Array.isArray(parsed.data)) {
          return parsed
        }
      } catch {
        // Invalid JSON
      }
    }

    return null
  }

  // Initialize SmartVis instance
  const initSmartVis = () => {
    if (!containerRef.value) return

    // Clean up existing instance
    if (smartVisRef.value) {
      smartVisRef.value.destroy()
      smartVisRef.value = null
    }

    // Create new instance
    smartVisRef.value = new SmartVis({
      container: containerRef.value,
      width: props.width,
      height: props.height,
      theme: props.theme,
      streaming: props.streaming,
      onChartClick: (chart, config) => {
        emit('chart-click', config)
      }
    })
  }

  // Render final chart
  const renderChart = (config: VisConfig) => {
    if (!smartVisRef.value) {
      initSmartVis()
    }

    if (smartVisRef.value) {
      try {
        smartVisRef.value.render(config)
        renderError.value = null
        emit('chart-ready', config)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown render error'
        renderError.value = errorMsg
        emit('chart-error', errorMsg)
      }
    }
  }

  // Handle streaming updates
  const handleStreaming = (content: string) => {
    if (!streamingDetector.value) {
      streamingDetector.value = new StreamingDetector()
    }

    const config = streamingDetector.value.detect(content)
    const previousState = streamingState.value.state
    streamingState.value = config

    // Emit state change if different
    if (previousState !== config.state) {
      emit('state-change', config.state)
    }

    // Handle different states
    switch (config.state) {
      case 'loading':
        // Chart block detected, placeholder shown via computed
        break

      case 'partial':
        // Partial data available, could show preview
        if (config.partialConfig) {
          extractedConfig.value = config.partialConfig
        }
        break

      case 'ready':
        // Complete config ready, render chart
        if (config.partialConfig) {
          extractedConfig.value = config.partialConfig
          nextTick(() => {
            renderChart(config.partialConfig as VisConfig)
          })
        }
        break

      case 'error':
        // Error occurred
        renderError.value = config.error || 'Streaming error'
        emit('chart-error', renderError.value)
        break
    }
  }

  // Handle non-streaming content
  const handleStaticContent = (content: string) => {
    const config = extractChartConfig(content)
    if (config) {
      extractedConfig.value = config
      streamingState.value = {
        state: 'ready',
        detectedType: config.type,
        partialConfig: config,
        progress: 100
      }
      nextTick(() => {
        renderChart(config)
      })
    } else {
      streamingState.value = {
        state: 'idle',
        detectedType: null,
        partialConfig: null,
        progress: 0
      }
    }
  }

  // Watch content changes
  watch(
    () => props.content,
    (newContent) => {
      if (props.streaming) {
        handleStreaming(newContent)
      } else {
        handleStaticContent(newContent)
      }
    },
    { immediate: true }
  )

  // Watch for streaming mode changes
  watch(
    () => props.streaming,
    (isStreaming) => {
      if (!isStreaming && streamingDetector.value) {
        streamingDetector.value.reset()
      }
    }
  )

  // Cleanup on unmount
  onUnmounted(() => {
    if (smartVisRef.value) {
      smartVisRef.value.destroy()
      smartVisRef.value = null
    }
    if (streamingDetector.value) {
      streamingDetector.value.reset()
    }
  })

  // Public methods
  const reset = () => {
    if (streamingDetector.value) {
      streamingDetector.value.reset()
    }
    if (smartVisRef.value) {
      smartVisRef.value.destroy()
      smartVisRef.value = null
    }
    extractedConfig.value = null
    renderError.value = null
    streamingState.value = {
      state: 'idle',
      detectedType: null,
      partialConfig: null,
      progress: 0
    }
  }

  const refresh = () => {
    if (extractedConfig.value && smartVisRef.value) {
      renderChart(extractedConfig.value)
    }
  }

  defineExpose({
    reset,
    refresh,
    getConfig: () => extractedConfig.value,
    getState: () => streamingState.value
  })
</script>

<template>
  <div class="vis-renderer" :class="`theme-${theme}`">
    <!-- Loading/Partial Placeholder -->
    <ChartPlaceholder
      v-if="showPlaceholder"
      :state="currentState"
      :progress="progress"
      :detected-type="detectedType"
      :title="chartTitle"
    />

    <!-- Chart Container -->
    <div
      v-show="showChart || (!showPlaceholder && !hasError)"
      ref="containerRef"
      class="vis-renderer-container"
      :style="{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        minHeight: '300px'
      }"
    />

    <!-- Error State -->
    <div v-if="hasError" class="vis-renderer-error">
      <div class="error-icon">⚠️</div>
      <div class="error-message">
        {{ renderError || streamingState.error || '图表渲染失败' }}
      </div>
      <button class="error-retry" @click="refresh">
        重试
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="currentState === 'idle' && !hasError && !extractedConfig"
      class="vis-renderer-empty"
    >
      <div class="empty-icon">📊</div>
      <div class="empty-text">等待图表数据...</div>
    </div>
  </div>
</template>

<style scoped>
  .vis-renderer {
    position: relative;
    width: 100%;
  }

  .vis-renderer-container {
    border-radius: 12px;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;
  }

  .vis-renderer-container:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .vis-renderer-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    gap: 12px;
  }

  .vis-renderer-error .error-icon {
    font-size: 32px;
  }

  .vis-renderer-error .error-message {
    color: #991b1b;
    font-size: 14px;
    text-align: center;
  }

  .vis-renderer-error .error-retry {
    padding: 8px 16px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .vis-renderer-error .error-retry:hover {
    background: #dc2626;
  }

  .vis-renderer-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background: #f9fafb;
    border: 1px dashed #d1d5db;
    border-radius: 12px;
    gap: 12px;
  }

  .vis-renderer-empty .empty-icon {
    font-size: 32px;
    opacity: 0.5;
  }

  .vis-renderer-empty .empty-text {
    color: #6b7280;
    font-size: 14px;
  }

  /* Dark theme */
  .vis-renderer.theme-dark .vis-renderer-container {
    background: #1f2937;
    border-color: #374151;
  }

  .vis-renderer.theme-dark .vis-renderer-error {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }

  .vis-renderer.theme-dark .vis-renderer-error .error-message {
    color: #fca5a5;
  }

  .vis-renderer.theme-dark .vis-renderer-empty {
    background: #1f2937;
    border-color: #374151;
  }

  .vis-renderer.theme-dark .vis-renderer-empty .empty-text {
    color: #9ca3af;
  }
</style>
