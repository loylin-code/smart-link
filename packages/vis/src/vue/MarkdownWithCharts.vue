<script setup lang="ts">
  import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
  import MarkdownIt from 'markdown-it'
  import { SmartVis } from '../core/SmartVis'
  import { StreamingDetector } from '../syntax/streaming-detector'
  import type { StreamingConfig, VisConfig, ChartBlockConfig } from '../types'
  import ChartPlaceholder from './ChartPlaceholder.vue'

  // Props - MUST be defined first before using in computed/watch
  const props = defineProps<{
    content: string
    streaming?: boolean
  }>()

  // Emits
  const emit = defineEmits<{
    'chart-click': [config: VisConfig]
    'chart-ready': [config: VisConfig]
  }>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const md: any = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  })

  // State
  const streamingState = ref<StreamingConfig>({
    state: 'idle',
    detectedType: null,
    partialConfig: null,
    progress: 0
  })

  const chartBlocks = ref<Array<{ id: string; config: VisConfig; element: HTMLElement | null }>>([])
  const smartVisInstances = ref<Map<string, SmartVis>>(new Map())
  const streamingDetector = ref<StreamingDetector | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  // Computed - now safe to use props after definition
  const hasChartBlocks = computed(() => {
    if (!props.content) return false
    return StreamingDetector.hasChartMarker(props.content)
  })

  // Parse chart blocks from markdown content
  const parseChartBlocks = (content: string): ChartBlockConfig[] => {
    if (!content) return []
    const blocks: ChartBlockConfig[] = []
    const codeBlockRegex = /```(?:chart-json|vis|chart)\s*\n([\s\S]*?)\n```/g
    let match: RegExpExecArray | null

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const raw = match[1].trim()
      const start = match.index
      const end = match.index + match[0].length

      try {
        const parsed = JSON.parse(raw) as VisConfig
        if (parsed.type && parsed.data) {
          blocks.push({
            config: parsed,
            raw,
            position: { start, end }
          })
        }
      } catch {
        // Invalid JSON, skip
      }
    }

    return blocks
  }

  // Replace chart blocks with placeholders in markdown
  const processMarkdownContent = (content: string): string => {
    if (!content || !hasChartBlocks.value) {
      return content || ''
    }

    let processed = content
    const blocks = parseChartBlocks(content)

    // Replace from end to start to preserve indices
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i]
      const placeholder = `<div class="chart-container" data-chart-id="${i}" data-chart-type="${block.config.type}"></div>`
      processed = processed.slice(0, block.position.start) + placeholder + processed.slice(block.position.end)
    }

    return processed
  }

  // Render markdown HTML
  const renderedHtml = computed(() => {
    const content = props.content || ''
    const processed = processMarkdownContent(content)
    return md.render(processed)
  })

  // Handle streaming updates
  const handleStreamingUpdate = (content: string) => {
    if (!streamingDetector.value) {
      streamingDetector.value = new StreamingDetector()
    }

    const config = streamingDetector.value.detect(content)
    streamingState.value = config

    // Emit ready event when complete
    if (config.state === 'ready' && config.partialConfig) {
      emit('chart-ready', config.partialConfig)
    }
  }

  // Watch content changes for streaming
  watch(
    () => props.content,
    (newContent) => {
      if (props.streaming && newContent && hasChartBlocks.value) {
        handleStreamingUpdate(newContent)
      }
    },
    { immediate: true }
  )

  // Mount charts after render
  const onContentMounted = async (container: HTMLElement) => {
    if (!container || !props.content) return

    // Clean up existing instances
    smartVisInstances.value.forEach((instance) => instance.destroy())
    smartVisInstances.value.clear()
    chartBlocks.value = []

    // Find all chart containers
    const chartContainers = container.querySelectorAll('.chart-container')

    console.log('[MarkdownWithCharts] Found chart containers:', chartContainers.length)

    if (chartContainers.length === 0) {
      console.log('[MarkdownWithCharts] No chart containers found. Content:', props.content.substring(0, 200))
      return
    }

    chartContainers.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      const chartId = `chart-${index}`
      htmlEl.dataset.chartId = chartId

      // Extract chart config from original content
      const blocks = parseChartBlocks(props.content)
      console.log('[MarkdownWithCharts] Parsed blocks:', blocks.length, 'Block', index, blocks[index]?.config)

      if (blocks[index]) {
        const config = blocks[index].config
        chartBlocks.value.push({ id: chartId, config, element: htmlEl })

        // Ensure container has dimensions
        if (htmlEl.clientWidth === 0) {
          htmlEl.style.width = '100%'
          htmlEl.style.minHeight = '300px'
        }

        // Create SmartVis instance
        const smartVis = new SmartVis({
          container: htmlEl,
          theme: 'light',
          streaming: props.streaming,
          onChartClick: (chart, cfg) => {
            emit('chart-click', cfg)
          }
        })

        smartVisInstances.value.set(chartId, smartVis)

        // Render chart with delay to ensure DOM is ready
        setTimeout(() => {
          try {
            smartVis.render(config)
            console.log('[MarkdownWithCharts] Chart rendered:', chartId, config.type)
          } catch (err) {
            console.error('[MarkdownWithCharts] Render error:', err)
          }
        }, 100)
      }
    })
  }

  // Watch for rendered HTML changes
  watch(renderedHtml, async () => {
    if (contentRef.value) {
      await nextTick()
      onContentMounted(contentRef.value)
    }
  })

  // Clean up on unmount
  onUnmounted(() => {
    smartVisInstances.value.forEach((instance) => instance.destroy())
    smartVisInstances.value.clear()
    if (streamingDetector.value) {
      streamingDetector.value.reset()
    }
  })

  defineExpose({
    reset: () => {
      streamingState.value = { state: 'idle', detectedType: null, partialConfig: null, progress: 0 }
      if (streamingDetector.value) streamingDetector.value.reset()
    }
  })
</script>

<template>
  <div class="markdown-with-charts">
    <!-- Streaming placeholder -->
    <ChartPlaceholder
      v-if="streaming && hasChartBlocks"
      :state="streamingState.state"
      :progress="streamingState.progress"
      :detected-type="streamingState.detectedType"
      :title="streamingState.partialConfig?.title"
    />

    <!-- Rendered markdown content -->
    <div
      ref="contentRef"
      class="markdown-content"
      v-html="renderedHtml"
    />
  </div>
</template>

<style scoped>
  .markdown-with-charts {
    position: relative;
    width: 100%;
    color: inherit;
  }

  .markdown-content {
    width: 100%;
    color: inherit;
  }

  /* Main text elements inherit parent color */
  .markdown-content :deep(p),
  .markdown-content :deep(h1),
  .markdown-content :deep(h2),
  .markdown-content :deep(h3),
  .markdown-content :deep(h4),
  .markdown-content :deep(h5),
  .markdown-content :deep(h6),
  .markdown-content :deep(li),
  .markdown-content :deep(span),
  .markdown-content :deep(strong),
  .markdown-content :deep(em) {
    color: inherit;
  }

  .markdown-content :deep(h1),
  .markdown-content :deep(h2),
  .markdown-content :deep(h3),
  .markdown-content :deep(h4),
  .markdown-content :deep(h5),
  .markdown-content :deep(h6) {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  .markdown-content :deep(h1) {
    font-size: 2em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 0.3em;
  }

  .markdown-content :deep(h2) {
    font-size: 1.5em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 0.3em;
  }

  .markdown-content :deep(h3) {
    font-size: 1.25em;
  }

  .markdown-content :deep(h4) {
    font-size: 1em;
  }

  .markdown-content :deep(p) {
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .markdown-content :deep(ul),
  .markdown-content :deep(ol) {
    margin-bottom: 16px;
    padding-left: 2em;
  }

  .markdown-content :deep(li) {
    margin-bottom: 4px;
  }

  .markdown-content :deep(pre) {
    background: rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 16px;
  }

  .markdown-content :deep(pre code) {
    background: transparent;
    padding: 0;
    font-size: 14px;
    line-height: 1.5;
  }

  .markdown-content :deep(code) {
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .markdown-content :deep(a) {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: rgba(255, 255, 255, 0.5);
  }

  .markdown-content :deep(a:hover) {
    text-decoration-color: currentColor;
  }

  .markdown-content :deep(blockquote) {
    border-left: 4px solid currentColor;
    opacity: 0.7;
    padding-left: 16px;
    margin-left: 0;
    margin-bottom: 16px;
  }

  .markdown-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
  }

  .markdown-content :deep(th),
  .markdown-content :deep(td) {
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 8px 12px;
    text-align: left;
  }

  .markdown-content :deep(th) {
    background: rgba(0, 0, 0, 0.1);
    font-weight: 600;
  }

  .markdown-content :deep(tr:nth-child(even)) {
    background: rgba(0, 0, 0, 0.05);
  }

  .markdown-content :deep(hr) {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    margin: 24px 0;
  }

  .markdown-content :deep(.chart-container) {
    margin: 24px 0;
    min-height: 300px;
    width: 100%;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #374151;
  }
</style>
