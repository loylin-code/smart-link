<template>
  <div class="preview-container">
    <!-- 预览工具栏 -->
    <div class="preview-toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" @click="handleRefresh" title="刷新">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M1 4v6h6M23 20v-6h-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="toolbar-center">
        <span class="preview-status" :class="statusClass">
          {{ statusText }}
        </span>
      </div>

      <div class="toolbar-right">
        <button class="tool-btn" @click="handleFullscreen" title="全屏">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 预览内容区域 -->
    <div class="preview-content" ref="previewRef">
      <!-- 加载状态 -->
      <div v-if="loading" class="preview-loading">
        <div class="loading-spinner"></div>
        <span>正在渲染...</span>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="preview-error">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          <path
            d="M12 8v4M12 16h.01"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="handleRefresh">重试</button>
      </div>

      <!-- 渲染内容 -->
      <div v-else class="preview-render" id="preview-mount"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { createApp, type App as VueApp } from 'vue'
  import type { PageSchema, RuntimeContext } from '@/types'
  import {
    createRenderer,
    createExpressionEvaluator,
    createComponentRegistry,
    createEventProcessor,
    createDirectiveProcessor,
    createStateManager
  } from '@smart-link/core'
  import { COMPONENT_META_LIST } from '@smart-link/shared'
  import * as UIComponents from '@smart-link/ui'

  const props = defineProps<{
    schema: PageSchema | null
  }>()

  // Refs
  const previewRef = ref<HTMLElement | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Vue应用实例
  let previewApp: VueApp | null = null

  // 状态
  const status = ref<'idle' | 'rendering' | 'success' | 'error'>('idle')

  // 计算属性
  const statusText = computed(() => {
    switch (status.value) {
      case 'idle':
        return '就绪'
      case 'rendering':
        return '渲染中'
      case 'success':
        return '运行中'
      case 'error':
        return '错误'
      default:
        return '未知'
    }
  })

  const statusClass = computed(() => ({
    'status-idle': status.value === 'idle',
    'status-rendering': status.value === 'rendering',
    'status-success': status.value === 'success',
    'status-error': status.value === 'error'
  }))

  // 渲染预览
  async function renderPreview() {
    if (!props.schema) {
      error.value = 'No schema provided'
      status.value = 'error'
      return
    }

    loading.value = true
    error.value = null
    status.value = 'rendering'

    try {
      // 销毁旧实例
      if (previewApp) {
        previewApp.unmount()
        previewApp = null
      }

      // 清空容器
      const mountEl = document.getElementById('preview-mount')
      if (mountEl) {
        mountEl.innerHTML = ''
      }

      // 创建渲染器
      const evaluator = createExpressionEvaluator()
      const registry = createComponentRegistry()
      const events = createEventProcessor()
      const directives = createDirectiveProcessor(evaluator)
      const stateManager = createStateManager()

      // 注册UI组件
      for (const [name, component] of Object.entries(UIComponents)) {
        if (typeof component === 'object' && component !== null && 'name' in component) {
          registry.register(name, component)
        }
      }

      // 注册组件元数据
      for (const meta of COMPONENT_META_LIST) {
        registry.register(meta.type, registry.get(meta.type) || null, meta)
      }

      // 创建运行时上下文
      const context: RuntimeContext = {
        state: stateManager.state,
        methods: {},
        setState: (path, value) => stateManager.set(path, value),
        getState: (path) => stateManager.get(path),
        registerMethod: (name, fn) => {
          context.methods[name] = fn
        },
        emit: () => {},
        api: {
          call: async () => {
            throw new Error('API not configured')
          },
          get: async () => {
            throw new Error('API not configured')
          },
          post: async () => {
            throw new Error('API not configured')
          }
        },
        router: {
          push: () => {},
          replace: () => {},
          back: () => {},
          forward: () => {},
          currentPath: '/',
          params: {},
          query: {}
        },
        message: {
          success: (msg) => console.log('[Success]', msg),
          error: (msg) => console.error('[Error]', msg),
          warning: (msg) => console.warn('[Warning]', msg),
          info: (msg) => console.info('[Info]', msg)
        }
      }

      // 创建渲染器
      const renderer = createRenderer({
        evaluator,
        registry,
        events,
        directives
      })

      // 创建Vue应用
      previewApp = createApp({
        name: 'PreviewApp',
        setup() {
          return () => renderer.renderPage(props.schema!, context)
        }
      })

      // 挂载
      if (mountEl) {
        previewApp.mount(mountEl)
      }

      status.value = 'success'
    } catch (err: any) {
      console.error('Preview render error:', err)
      error.value = err.message || '渲染失败'
      status.value = 'error'
    } finally {
      loading.value = false
    }
  }

  // 刷新
  function handleRefresh() {
    renderPreview()
  }

  // 全屏
  function handleFullscreen() {
    if (previewRef.value) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        previewRef.value.requestFullscreen()
      }
    }
  }

  // 监听schema变化
  watch(
    () => props.schema,
    () => {
      if (props.schema) {
        renderPreview()
      }
    },
    { deep: true }
  )

  // 生命周期
  onMounted(() => {
    if (props.schema) {
      renderPreview()
    }
  })

  onUnmounted(() => {
    if (previewApp) {
      previewApp.unmount()
      previewApp = null
    }
  })
</script>

<style scoped lang="scss">
  .preview-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
  }

  .preview-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tool-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }
  }

  .toolbar-center {
    display: flex;
    align-items: center;
  }

  .preview-status {
    padding: 4px 12px;
    font-size: 12px;
    border-radius: 4px;

    &.status-idle {
      background: #f0f0f0;
      color: #909399;
    }

    &.status-rendering {
      background: #e6f7ff;
      color: #1890ff;
    }

    &.status-success {
      background: #f6ffed;
      color: #52c41a;
    }

    &.status-error {
      background: #fff2f0;
      color: #ff4d4f;
    }
  }

  .preview-content {
    flex: 1;
    overflow: auto;
    position: relative;
  }

  .preview-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #909399;
    font-size: 14px;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e4e7ed;
    border-top-color: #409eff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .preview-error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #f56c6c;

    svg {
      width: 48px;
      height: 48px;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }

  .retry-btn {
    padding: 8px 24px;
    background: #409eff;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background: #66b1ff;
    }
  }

  .preview-render {
    min-height: 100%;
    padding: 16px;
  }
</style>
