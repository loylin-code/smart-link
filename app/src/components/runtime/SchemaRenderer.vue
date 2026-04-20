<template>
  <div class="schema-renderer" :class="{ 'schema-renderer--loading': loading }">
    <!-- Loading State -->
    <div v-if="loading" class="schema-renderer__loading">
      <div class="skeleton">
        <div class="skeleton__line skeleton__line--wide"></div>
        <div class="skeleton__line skeleton__line--medium"></div>
        <div class="skeleton__line skeleton__line--narrow"></div>
        <div class="skeleton__content">
          <div class="skeleton__block skeleton__block--large"></div>
          <div class="skeleton__block skeleton__block--small"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="schema-renderer__error">
      <svg viewBox="0 0 24 24" fill="none" class="error-icon">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
          fill="currentColor"
        />
      </svg>
      <div class="error-message">{{ error }}</div>
      <button class="retry-btn" @click="handleRetry">重试</button>
    </div>

    <!-- Rendered Content -->
    <div v-else-if="renderedVNode" class="schema-renderer__content">
      <component :is="renderedVNode" />
    </div>

    <!-- Empty State -->
    <div v-else class="schema-renderer__empty">
      <svg viewBox="0 0 24 24" fill="none" class="empty-icon">
        <path
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
          fill="currentColor"
        />
      </svg>
      <div class="empty-text">暂无内容</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, type VNode } from 'vue'
  import type { PageSchema, Renderer, RuntimeContext } from '@smart-link/core'
  import { createFullRenderer, createStateManagerWithComputed } from '@smart-link/core'

  // ============================================================
  // Types
  // ============================================================

  interface Props {
    schema: PageSchema | null
    loading?: boolean
    error?: string | null
  }

  interface Emits {
    (e: 'rendered'): void
    (e: 'error', error: Error): void
    (e: 'interaction', event: InteractionEvent): void
  }

  interface InteractionEvent {
    type: 'click' | 'input' | 'change' | 'submit'
    componentId: string
    data: any
    timestamp: number
  }

  // ============================================================
  // Props & Emits
  // ============================================================

  const props = withDefaults(defineProps<Props>(), {
    schema: null,
    loading: false,
    error: null
  })

  const emit = defineEmits<Emits>()

  // ============================================================
  // State
  // ============================================================

  const renderedVNode = ref<VNode | null>(null)
  let renderer: Renderer | null = null
  let runtimeContext: RuntimeContext | null = null

  // ============================================================
  // Helper Functions
  // ============================================================

  /**
   * Create mock runtime context for basic functionality
   */
  function createRuntimeContext(): RuntimeContext {
    const stateManager = createStateManagerWithComputed({})

    return {
      state: stateManager.state,
      methods: {},
      setState: (path: string, value: any) => stateManager.set(path, value),
      getState: (path: string) => stateManager.get(path),
      registerMethod: (name: string, fn: (...args: any[]) => any) => {
        runtimeContext!.methods[name] = fn
      },
      emit: (event: string, payload?: any) => {
        console.log('[RuntimeContext] Event emitted:', event, payload)
      },
      api: {
        call: async (config: any) => {
          console.log('[RuntimeContext] API call:', config)
          return {}
        },
        get: async (id: string) => {
          console.log('[RuntimeContext] API get:', id)
          return {}
        },
        post: async (id: string) => {
          console.log('[RuntimeContext] API post:', id)
          return {}
        }
      },
      router: {
        push: (path: string) => console.log('[Router] Push:', path),
        replace: (path: string) => console.log('[Router] Replace:', path),
        back: () => console.log('[Router] Back'),
        forward: () => console.log('[Router] Forward'),
        currentPath: window.location.pathname,
        params: {},
        query: {}
      },
      message: {
        success: (msg: string) => console.log('[Message] Success:', msg),
        error: (msg: string) => console.log('[Message] Error:', msg),
        warning: (msg: string) => console.log('[Message] Warning:', msg),
        info: (msg: string) => console.log('[Message] Info:', msg)
      }
    }
  }

  /**
   * Log user interactions
   */
  function logInteraction(type: InteractionEvent['type'], componentId: string, data: any): void {
    const event: InteractionEvent = {
      type,
      componentId,
      data,
      timestamp: Date.now()
    }
    emit('interaction', event)
  }

  /**
   * Render the schema
   */
  function renderSchema(schema: PageSchema): void {
    try {
      if (!renderer || !runtimeContext) {
        throw new Error('Renderer not initialized')
      }

      // Create event processor wrapper for interaction logging
      const eventProcessor = (renderer as any).events
      if (eventProcessor) {
        const originalHandle = eventProcessor.handle.bind(eventProcessor)
        eventProcessor.handle = async (binding: any, context: any, _event: any) => {
          // Log interaction
          const eventType = binding.event as InteractionEvent['type']
          logInteraction(eventType, schema.root.id, { event: binding.event, originalEvent: _event })
          return originalHandle(binding, context, _event)
        }
      }

      renderedVNode.value = renderer.renderPage(schema, runtimeContext)
      emit('rendered')
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      emit('error', error)
      console.error('[SchemaRenderer] Render error:', error)
    }
  }

  /**
   * Handle retry
   */
  function handleRetry(): void {
    if (props.schema) {
      renderSchema(props.schema)
    }
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  onMounted(() => {
    try {
      // Initialize renderer
      const fullRenderer = createFullRenderer()
      renderer = fullRenderer

      // Components are already registered in @smart-link/ui

      // Create runtime context
      runtimeContext = createRuntimeContext()

      // Render initial schema if available
      if (props.schema && !props.loading && !props.error) {
        renderSchema(props.schema)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      emit('error', error)
      console.error('[SchemaRenderer] Initialization error:', error)
    }
  })

  onUnmounted(() => {
    if (renderer) {
      renderer.destroy()
      renderer = null
    }
    runtimeContext = null
  })

  // ============================================================
  // Watchers
  // ============================================================

  watch(
    () => props.schema,
    (newSchema) => {
      if (newSchema && !props.loading && !props.error && renderer && runtimeContext) {
        renderSchema(newSchema)
      }
    },
    { deep: true }
  )

  watch(
    () => props.loading,
    () => {
      // Clear rendered content when loading starts
      if (props.loading) {
        renderedVNode.value = null
      }
    }
  )

  watch(
    () => props.error,
    () => {
      // Clear rendered content when error occurs
      if (props.error) {
        renderedVNode.value = null
      }
    }
  )
</script>

<style scoped lang="scss">
  // Variables
  $bg-primary: #0a0e27;
  $bg-secondary: #11163d;
  $accent: #00d4ff;
  $accent-hover: #00b8e6;
  $text-primary: rgba(255, 255, 255, 0.85);
  $text-secondary: rgba(255, 255, 255, 0.65);
  $text-tertiary: rgba(255, 255, 255, 0.45);
  $error-color: #ff4d4f;
  $success-color: #52c41a;
  $border-color: rgba(255, 255, 255, 0.1);
  $border-radius: 8px;
  $transition-base: 0.3s ease;

  .schema-renderer {
    width: 100%;
    height: 100%;
    min-height: 400px;
    background: $bg-primary;
    color: $text-primary;
    overflow: auto;
    position: relative;

    &--loading {
      pointer-events: none;
    }
  }

  // ============================================================
  // Loading State - Skeleton
  // ============================================================

  .schema-renderer__loading {
    padding: 24px;
    animation: fadeIn 0.3s ease;
  }

  .skeleton {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &__line {
      height: 16px;
      background: linear-gradient(90deg, $bg-secondary 25%, $bg-primary 50%, $bg-secondary 75%);
      background-size: 200% 100%;
      border-radius: $border-radius;
      animation: shimmer 1.5s infinite;

      &--wide {
        width: 100%;
      }

      &--medium {
        width: 70%;
      }

      &--narrow {
        width: 50%;
      }
    }

    &__content {
      display: flex;
      gap: 16px;
      margin-top: 8px;
    }

    &__block {
      height: 120px;
      background: linear-gradient(90deg, $bg-secondary 25%, $bg-primary 50%, $bg-secondary 75%);
      background-size: 200% 100%;
      border-radius: $border-radius;
      animation: shimmer 1.5s infinite;

      &--large {
        flex: 1;
      }

      &--small {
        width: 150px;
        flex-shrink: 0;
      }
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  // ============================================================
  // Error State
  // ============================================================

  .schema-renderer__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
    padding: 32px;
    text-align: center;
    animation: shakeIn 0.4s ease;

    .error-icon {
      width: 64px;
      height: 64px;
      color: $error-color;
      margin-bottom: 16px;
    }

    .error-message {
      font-size: 16px;
      color: $text-secondary;
      margin-bottom: 24px;
      max-width: 400px;
      line-height: 1.5;
    }

    .retry-btn {
      padding: 10px 24px;
      background: $accent;
      color: $bg-primary;
      border: none;
      border-radius: $border-radius;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all $transition-base;

      &:hover {
        background: $accent-hover;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  @keyframes shakeIn {
    0% {
      opacity: 0;
      transform: translateX(-10px);
    }
    25% {
      transform: translateX(5px);
    }
    50% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  // ============================================================
  // Content Area
  // ============================================================

  .schema-renderer__content {
    width: 100%;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;

    :deep(*) {
      box-sizing: border-box;
    }
  }

  // ============================================================
  // Empty State
  // ============================================================

  .schema-renderer__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
    color: $text-tertiary;

    .empty-icon {
      width: 80px;
      height: 80px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 16px;
      color: $text-tertiary;
    }
  }

  // ============================================================
  // Responsive
  // ============================================================

  @media (max-width: 768px) {
    .schema-renderer {
      min-height: 100vh;
    }

    .schema-renderer__loading,
    .schema-renderer__error,
    .schema-renderer__content {
      padding: 12px;
    }

    .skeleton__block--small {
      width: 100px;
    }
  }
</style>
