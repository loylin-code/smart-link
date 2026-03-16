<template>
  <div class="ai-chat-panel">
    <!-- 头部 -->
    <div class="chat-header">
      <div class="header-title">
        <svg viewBox="0 0 24 24" fill="none" class="ai-icon">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
            fill="currentColor"
          />
        </svg>
        <span>AI 助手</span>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="handleClear" title="清空对话">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button class="action-btn" @click="toggleSettings" title="设置">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 设置面板 -->
    <div v-if="showSettings" class="settings-panel">
      <div class="setting-item">
        <label>AI 提供商</label>
        <select v-model="provider" class="setting-select">
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="ollama">Ollama (本地)</option>
          <option value="custom">自定义</option>
        </select>
      </div>
      <div class="setting-item">
        <label>API Key</label>
        <input v-model="apiKey" type="password" class="setting-input" placeholder="输入 API Key" />
      </div>
      <div v-if="provider === 'ollama' || provider === 'custom'" class="setting-item">
        <label>API 地址</label>
        <input
          v-model="baseUrl"
          type="text"
          class="setting-input"
          :placeholder="provider === 'ollama' ? 'http://localhost:11434' : 'API URL'"
        />
      </div>
      <div class="setting-item">
        <label>模型</label>
        <input v-model="model" type="text" class="setting-input" :placeholder="defaultModel" />
      </div>
      <button class="save-btn" @click="saveSettings">保存设置</button>
    </div>

    <!-- 消息列表 -->
    <div ref="messagesRef" class="messages-container">
      <div v-if="messages.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" class="empty-icon">
          <path
            d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
            fill="currentColor"
          />
        </svg>
        <p>描述你想要的页面，AI 将为你生成</p>
        <div class="suggestions">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="suggestion-btn"
            @click="handleSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <div v-for="message in messages" :key="message.id" class="message" :class="message.role">
        <div class="message-avatar">
          <span v-if="message.role === 'user'">我</span>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div class="message-content">
          <div class="message-text">{{ message.content }}</div>
          <div v-if="message.status === 'pending'" class="message-status">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </div>
          <div v-if="message.schema && message.status === 'success'" class="message-actions">
            <button class="apply-btn" @click="handleApplySchema(message.schema!)">
              应用到画布
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <textarea
        v-model="inputText"
        class="input-textarea"
        placeholder="描述你想要的页面，例如：创建一个用户登录表单..."
        :disabled="isGenerating"
        @keydown.enter.ctrl="handleSend"
      ></textarea>
      <button
        class="send-btn"
        :class="{ disabled: !canSend }"
        :disabled="!canSend"
        @click="handleSend"
      >
        <svg v-if="!isGenerating" viewBox="0 0 24 24" fill="none">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
        </svg>
        <span v-else class="loading-spinner"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick, watch } from 'vue'
  import { useAIStore } from '@/store/modules/ai'
  import { useOrchestratorStore } from '@/store/modules/orchestrator'
  import type { PageSchema } from '@smart-link/core'

  const aiStore = useAIStore()
  const orchestratorStore = useOrchestratorStore()

  // Refs
  const messagesRef = ref<HTMLElement | null>(null)
  const inputText = ref('')
  const showSettings = ref(false)

  // 设置表单
  const provider = ref(aiStore.config.provider)
  const apiKey = ref(aiStore.config.apiKey || '')
  const baseUrl = ref(aiStore.config.baseUrl || '')
  const model = ref(aiStore.config.model || '')

  // 计算属性
  const messages = computed(() => aiStore.conversationHistory)
  const isGenerating = computed(() => aiStore.isGenerating)
  const canSend = computed(() => inputText.value.trim().length > 0 && !isGenerating.value)

  const defaultModel = computed(() => {
    switch (provider.value) {
      case 'openai':
        return 'gpt-4o'
      case 'anthropic':
        return 'claude-3-5-sonnet-20241022'
      case 'ollama':
        return 'llama3'
      default:
        return ''
    }
  })

  // 建议提示
  const suggestions = [
    '创建一个用户登录表单',
    '设计一个数据展示表格',
    '生成一个仪表盘页面',
    '创建一个搜索页面'
  ]

  // 方法
  function toggleSettings() {
    showSettings.value = !showSettings.value
  }

  function saveSettings() {
    aiStore.updateConfig({
      provider: provider.value as any,
      apiKey: apiKey.value,
      baseUrl: baseUrl.value,
      model: model.value || undefined
    })
    showSettings.value = false
  }

  async function handleSend() {
    if (!canSend.value) return

    const prompt = inputText.value.trim()
    inputText.value = ''

    const schema = await aiStore.generateSchema(prompt)

    if (schema) {
      // 自动应用到画布
      await nextTick()
      scrollToBottom()
    }
  }

  function handleSuggestion(suggestion: string) {
    inputText.value = suggestion
    handleSend()
  }

  function handleClear() {
    aiStore.clearMessages()
  }

  async function handleApplySchema(schema: PageSchema) {
    orchestratorStore.initSchema(schema)
  }

  function scrollToBottom() {
    nextTick(() => {
      if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    })
  }

  // 监听消息变化
  watch(
    () => aiStore.messages.length,
    () => {
      scrollToBottom()
    }
  )
</script>

<style scoped lang="scss">
  .ai-chat-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #303133;

    .ai-icon {
      width: 20px;
      height: 20px;
      color: #409eff;
    }
  }

  .header-actions {
    display: flex;
    gap: 4px;
  }

  .action-btn {
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

  .settings-panel {
    padding: 16px;
    background: #fafafa;
    border-bottom: 1px solid #e4e7ed;
  }

  .setting-item {
    margin-bottom: 12px;

    label {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      color: #606266;
    }
  }

  .setting-select,
  .setting-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 13px;
    outline: none;

    &:focus {
      border-color: #409eff;
    }
  }

  .save-btn {
    width: 100%;
    padding: 8px;
    background: #409eff;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-size: 13px;
    cursor: pointer;

    &:hover {
      background: #66b1ff;
    }
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;
    text-align: center;

    .empty-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    p {
      margin: 0 0 16px;
      font-size: 14px;
    }
  }

  .suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .suggestion-btn {
    padding: 6px 12px;
    background: #f0f7ff;
    border: 1px solid #b3d8ff;
    border-radius: 16px;
    color: #409eff;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      background: #409eff;
      color: #fff;
    }
  }

  .message {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;

    &.user {
      flex-direction: row-reverse;

      .message-avatar {
        background: #409eff;
        color: #fff;
      }

      .message-content {
        align-items: flex-end;
      }

      .message-text {
        background: #409eff;
        color: #fff;
      }
    }

    &.assistant {
      .message-avatar {
        background: #e6f7ff;
        color: #409eff;
      }

      .message-text {
        background: #f5f7fa;
      }
    }
  }

  .message-avatar {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .message-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 80%;
  }

  .message-text {
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .message-status {
    display: flex;
    gap: 4px;
    padding: 4px 0;
  }

  .loading-dot {
    width: 6px;
    height: 6px;
    background: #409eff;
    border-radius: 50%;
    animation: dotPulse 1.4s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }

  @keyframes dotPulse {
    0%,
    80%,
    100% {
      transform: scale(0.6);
      opacity: 0.4;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .message-actions {
    display: flex;
    gap: 8px;
  }

  .apply-btn {
    padding: 4px 12px;
    background: #67c23a;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      background: #85ce61;
    }
  }

  .input-container {
    display: flex;
    gap: 8px;
    padding: 12px;
    background: #f5f7fa;
    border-top: 1px solid #e4e7ed;
  }

  .input-textarea {
    flex: 1;
    min-height: 36px;
    max-height: 120px;
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    font-size: 13px;
    resize: none;
    outline: none;

    &:focus {
      border-color: #409eff;
    }

    &:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }
  }

  .send-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #409eff;
    border: none;
    border-radius: 6px;
    color: #fff;
    cursor: pointer;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover:not(.disabled) {
      background: #66b1ff;
    }

    &.disabled {
      background: #a0cfff;
      cursor: not-allowed;
    }
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
