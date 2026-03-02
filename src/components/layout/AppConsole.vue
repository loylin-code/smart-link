<template>
  <div class="app-console" :class="{ 'app-console--hidden': !isVisible }" :style="{ height: height + 'px' }">
    <div class="console-header">
      <div class="console-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="console-tab"
          :class="{ 'console-tab--active': activeTab === tab.key }"
          @click="setActiveTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="console-actions">
        <button class="console-action" @click="clearLogs" title="清空">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="console-action" @click="toggleMinimize" :title="isVisible ? '最小化' : '展开'">
          <svg v-if="isVisible" viewBox="0 0 24 24" fill="none">
            <path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="console-action console-action--close" @click="toggleConsole" title="关闭">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="console-resize" @mousedown="startResize"></div>

    <div class="console-body">
      <div v-if="activeTab === 'console'" class="console-content">
        <div
          v-for="log in logs"
          :key="log.id"
          class="console-log"
          :class="`console-log--${log.type}`"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-type">[{{ log.type.toUpperCase() }}]</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <div v-if="logs.length === 0" class="console-empty">
          暂无日志
        </div>
      </div>

      <div v-else-if="activeTab === 'logs'" class="console-content">
        <div class="console-empty">系统日志</div>
      </div>

      <div v-else-if="activeTab === 'output'" class="console-content">
        <div class="console-empty">输出结果</div>
      </div>

      <div v-else-if="activeTab === 'terminal'" class="console-content">
        <div class="terminal">
          <div class="terminal-line">
            <span class="terminal-prompt">$</span>
            <input
              type="text"
              class="terminal-input"
              v-model="terminalInput"
              @keyup.enter="executeCommand"
              placeholder="输入命令..."
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/store'
import type { ConsoleLog } from '@/types'

const appStore = useAppStore()

const tabs = [
  { key: 'console', label: 'Console' },
  { key: 'logs', label: 'Logs' },
  { key: 'output', label: 'Output' },
  { key: 'terminal', label: 'Terminal' }
]

const logs = ref<ConsoleLog[]>([
  {
    id: '1',
    type: 'info',
    message: 'SmartLink 平台初始化成功',
    timestamp: Date.now()
  },
  {
    id: '2',
    type: 'success',
    message: 'Agent 服务已启动',
    timestamp: Date.now()
  }
])

const terminalInput = ref('')
const isResizing = ref(false)

const isVisible = computed(() => appStore.isConsoleVisible)
const height = computed(() => appStore.consoleHeight)
const activeTab = computed({
  get: () => appStore.consoleActiveTab,
  set: (value) => appStore.setConsoleTab(value)
})

const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

const toggleConsole = () => {
  appStore.toggleConsole()
}

const toggleMinimize = () => {
  if (height.value > 100) {
    appStore.setConsoleHeight(40)
  } else {
    appStore.setConsoleHeight(200)
  }
}

const clearLogs = () => {
  logs.value = []
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour12: false })
}

const executeCommand = () => {
  if (terminalInput.value.trim()) {
    logs.value.push({
      id: Date.now().toString(),
      type: 'info',
      message: `> ${terminalInput.value}`,
      timestamp: Date.now()
    })
    terminalInput.value = ''
  }
}

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  const startY = e.clientY
  const startHeight = height.value

  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return
    const diff = startY - e.clientY
    const newHeight = Math.max(40, Math.min(500, startHeight + diff))
    appStore.setConsoleHeight(newHeight)
  }

  const onMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

onMounted(() => {
  // 模拟添加日志
  setTimeout(() => {
    logs.value.push({
      id: '3',
      type: 'warn',
      message: '检测到新版本可用',
      timestamp: Date.now()
    })
  }, 3000)
})
</script>

<style scoped lang="scss">
.app-console {
  position: fixed;
  bottom: 0;
  left: $sidebar-width;
  right: 0;
  background: $bg-secondary;
  border-top: 1px solid $bg-elevated;
  display: flex;
  flex-direction: column;
  transition: height $transition-base ease, transform $transition-base ease;
  z-index: 1000;

  &--hidden {
    height: 40px !important;
  }
}

.console-header {
  height: 40px;
  background: $bg-tertiary;
  border-bottom: 1px solid $bg-elevated;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-md;
}

.console-tabs {
  display: flex;
  gap: $spacing-xs;
}

.console-tab {
  padding: $spacing-xs $spacing-md;
  background: transparent;
  border-radius: $border-radius-sm;
  color: $text-secondary;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: all $transition-base ease;

  &:hover {
    background: $bg-elevated;
    color: $text-primary;
  }

  &--active {
    background: rgba(0, 212, 255, 0.1);
    color: $primary-color;
  }
}

.console-actions {
  display: flex;
  gap: $spacing-xs;
}

.console-action {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-sm;
  color: $text-tertiary;
  cursor: pointer;
  transition: all $transition-base ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: $bg-elevated;
    color: $text-primary;
  }

  &--close:hover {
    background: rgba(239, 68, 68, 0.1);
    color: $error;
  }
}

.console-resize {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  cursor: ns-resize;
  background: transparent;

  &:hover {
    background: $primary-color;
  }
}

.console-body {
  flex: 1;
  overflow: hidden;
}

.console-content {
  height: 100%;
  padding: $spacing-md;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: $font-size-sm;
}

.console-log {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-xs 0;
  color: $text-secondary;

  &--info {
    .log-type {
      color: $info;
    }
  }

  &--success {
    .log-type {
      color: $success;
    }
  }

  &--warn {
    .log-type {
      color: $warning;
    }
  }

  &--error {
    .log-type {
      color: $error;
    }
  }

  .log-time {
    color: $text-tertiary;
  }

  .log-type {
    font-weight: $font-weight-semibold;
  }

  .log-message {
    flex: 1;
  }
}

.console-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-tertiary;
}

.terminal {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.terminal-line {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.terminal-prompt {
  color: $primary-color;
  font-weight: $font-weight-bold;
}

.terminal-input {
  flex: 1;
  background: transparent;
  color: $text-primary;
  font-family: inherit;
  font-size: inherit;

  &::placeholder {
    color: $text-tertiary;
  }
}
</style>
