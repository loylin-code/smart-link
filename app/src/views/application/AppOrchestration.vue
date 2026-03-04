<template>
  <div class="app-orchestration">
    <!-- 顶部工具栏 -->
    <div class="orchestration-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h1 class="page-title">{{ t('orchestrator.title') }}</h1>
      </div>

      <div class="header-center">
        <div class="mode-switcher">
          <button class="mode-btn" :class="{ active: mode === 'design' }" @click="mode = 'design'">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ t('orchestrator.design') }}</span>
          </button>
          <button
            class="mode-btn"
            :class="{ active: mode === 'preview' }"
            @click="mode = 'preview'"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
            </svg>
            <span>{{ t('orchestrator.preview') }}</span>
          </button>
        </div>
      </div>

      <div class="header-right">
        <button
          class="action-btn"
          :class="{ active: aiPanelVisible }"
          @click="toggleAIPanel"
          title="AI助手"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button class="action-btn" @click="handleUndo" :disabled="!canUndo">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M3 10h10a5 5 0 015 5v2M3 10l6 6M3 10l6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button class="action-btn" @click="handleRedo" :disabled="!canRedo">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M21 10h-10a5 5 0 00-5 5v2M21 10l-6 6M21 10l-6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button class="action-btn action-btn--primary" @click="handleSave">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline
              points="17 21 17 13 7 13 7 21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline
              points="7 3 7 8 15 8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t('orchestrator.save') }}</span>
        </button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="orchestration-content">
      <!-- 设计模式 -->
      <template v-if="mode === 'design'">
        <!-- 左侧面板 - 组件库 -->
        <div
          v-if="panels.leftVisible"
          class="left-panel"
          :style="{ width: `${panels.leftWidth}px` }"
        >
          <ComponentLibrary />
        </div>

        <!-- 中间画布 -->
        <div class="canvas-panel">
          <DesignCanvas />
        </div>

        <!-- 右侧面板 - 属性 -->
        <div
          v-if="panels.rightVisible"
          class="right-panel"
          :style="{ width: `${panels.rightWidth}px` }"
        >
          <PropsPanel />
        </div>

        <!-- AI面板 -->
        <div v-if="aiPanelVisible" class="ai-panel" :style="{ width: `${aiPanelWidth}px` }">
          <AIChatPanel />
        </div>
      </template>

      <!-- 预览模式 -->
      <template v-else>
        <PreviewContainer :schema="currentSchema" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useOrchestratorStore } from '@/store/modules/orchestrator'
  import { useAIStore } from '@/store/modules/ai'
  import ComponentLibrary from '@/components/orchestrator/ComponentLibrary.vue'
  import DesignCanvas from '@/components/orchestrator/DesignCanvas.vue'
  import PropsPanel from '@/components/orchestrator/PropsPanel.vue'
  import PreviewContainer from '@/components/orchestrator/PreviewContainer.vue'
  import AIChatPanel from '@/components/ai/AIChatPanel.vue'

  const router = useRouter()
  const { t } = useI18n()
  const store = useOrchestratorStore()
  const aiStore = useAIStore()

  // 计算属性
  const mode = computed({
    get: () => store.mode,
    set: (val) => {
      store.mode = val
    }
  })

  const panels = computed(() => store.panels)
  const canUndo = computed(() => store.canUndo)
  const canRedo = computed(() => store.canRedo)
  const currentSchema = computed(() => store.currentSchema)
  const aiPanelVisible = computed(() => aiStore.panelVisible)
  const aiPanelWidth = computed(() => aiStore.panelWidth)

  // 返回列表
  function handleBack() {
    router.push('/app/application/design')
  }

  // 撤销
  function handleUndo() {
    store.undo()
  }

  // 重做
  function handleRedo() {
    store.redo()
  }

  // 保存
  function handleSave() {
    // TODO: 调用保存API
    console.log('保存Schema:', store.currentSchema)
  }

  // 切换AI面板
  function toggleAIPanel() {
    aiStore.togglePanel()
  }

  // 键盘快捷键
  function handleKeyDown(event: KeyboardEvent) {
    // Ctrl/Cmd + S 保存
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      handleSave()
    }

    // Ctrl/Cmd + Z 撤销
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      if (canUndo.value) {
        event.preventDefault()
        handleUndo()
      }
    }

    // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y 重做
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === 'y' || (event.shiftKey && event.key === 'z'))
    ) {
      if (canRedo.value) {
        event.preventDefault()
        handleRedo()
      }
    }
  }

  // 生命周期
  onMounted(() => {
    // 初始化Schema
    store.initSchema()
    // 注册快捷键
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
</script>

<style scoped lang="scss">
  .app-orchestration {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: $bg-secondary;
    color: $text-primary;
  }

  // ============================================================
  // Header
  // ============================================================

  .orchestration-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 $spacing-lg;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-lighter;
    box-shadow: $shadow-sm;
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .back-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
      background: rgba($primary-color, 0.05);
    }
  }

  .page-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .header-center {
    display: flex;
    align-items: center;
  }

  .mode-switcher {
    display: flex;
    background: $bg-secondary;
    padding: 4px;
    border-radius: $border-radius-md;
    border: 1px solid $border-color-lighter;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: none;
    border-radius: $border-radius-sm;
    color: $text-tertiary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: $text-primary;
      background: rgba($primary-color, 0.05);
    }

    &.active {
      background: $primary-color;
      color: #fff;
      box-shadow: $shadow-sm;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
      background: rgba($primary-color, 0.05);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &--primary {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;

      &:hover:not(:disabled) {
        background: $primary-light;
        border-color: $primary-light;
      }
    }

    &.active {
      background: rgba($primary-color, 0.1);
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  // ============================================================
  // Content Area
  // ============================================================

  .orchestration-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  // ============================================================
  // Left Panel - Component Library
  // ============================================================

  .left-panel {
    width: 280px;
    flex-shrink: 0;
    background: $bg-primary;
    border-right: 1px solid $border-color-lighter;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  // ============================================================
  // Canvas Panel
  // ============================================================

  .canvas-panel {
    flex: 1;
    overflow: hidden;
    background: $bg-secondary;
    display: flex;
    flex-direction: column;
  }

  // ============================================================
  // Right Panel - Properties
  // ============================================================

  .right-panel {
    width: 320px;
    flex-shrink: 0;
    background: $bg-primary;
    border-left: 1px solid $border-color-lighter;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  // ============================================================
  // AI Panel
  // ============================================================

  .ai-panel {
    width: 380px;
    flex-shrink: 0;
    background: $bg-primary;
    border-left: 1px solid $border-color-lighter;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: $shadow-lg;
  }
</style>
