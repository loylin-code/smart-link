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
  import ComponentLibrary from '@/components/orchestrator/ComponentLibrary.vue'
  import DesignCanvas from '@/components/orchestrator/DesignCanvas.vue'
  import PropsPanel from '@/components/orchestrator/PropsPanel.vue'
  import PreviewContainer from '@/components/orchestrator/PreviewContainer.vue'

  const router = useRouter()
  const { t } = useI18n()
  const store = useOrchestratorStore()

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

  // 返回列表
  function handleBack() {
    router.push('/app/application/list')
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
    background: #0a0e27;
    color: rgba(255, 255, 255, 0.85);
  }

  .orchestration-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 20px;
    background: rgba(21, 27, 61, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .back-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;
    transition: all 0.2s;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: #00d4ff;
      color: #00d4ff;
    }
  }

  .page-title {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
  }

  .header-center {
    display: flex;
    align-items: center;
  }

  .mode-switcher {
    display: flex;
    background: rgba(255, 255, 255, 0.04);
    padding: 4px;
    border-radius: 8px;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.45);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: rgba(255, 255, 255, 0.85);
    }

    &.active {
      background: #00d4ff;
      color: #fff;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.65);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.85);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &--primary {
      background: #00d4ff;
      border-color: #00d4ff;
      color: #fff;

      &:hover:not(:disabled) {
        background: #4de8ff;
        border-color: #4de8ff;
      }
    }
  }

  .orchestration-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .left-panel {
    flex-shrink: 0;
    background: rgba(21, 27, 61, 0.5);
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  .canvas-panel {
    flex: 1;
    overflow: hidden;
  }

  .right-panel {
    flex-shrink: 0;
    background: rgba(21, 27, 61, 0.5);
    border-left: 1px solid rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }
</style>
