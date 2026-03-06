<template>
  <div class="explore-view">
    <!-- 左侧边栏 -->
    <div class="explore-sidebar">
      <!-- 新建对话按钮 -->
      <div class="sidebar-header">
        <button class="new-chat-btn" @click="createNewChat">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t('explore.newChat') }}</span>
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="sidebar-search">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="t('explore.searchPlaceholder')"
          />
        </div>
      </div>

      <!-- 对话列表 -->
      <div class="conversation-list">
        <!-- 按时间分组 -->
        <div v-for="group in groupedConversations" :key="group.key" class="conversation-group">
          <div class="group-header" @click="toggleGroup(group.key)">
            <svg
              class="collapse-icon"
              :class="{ collapsed: collapsedGroups.includes(group.key) }"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="group-label">{{ group.label }}</span>
            <span class="group-count">{{ group.conversations.length }}</span>
          </div>

          <div v-show="!collapsedGroups.includes(group.key)" class="group-items">
            <div
              v-for="conv in group.conversations"
              :key="conv.id"
              class="conversation-item"
              :class="{ active: activeConversationId === conv.id }"
              @click="selectConversation(conv.id)"
            >
              <div class="conv-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="conv-info">
                <div class="conv-title">{{ conv.title }}</div>
                <div class="conv-meta">
                  <span>{{ formatTime(conv.updatedAt) }}</span>
                  <span class="dot">·</span>
                  <span>{{ conv.messages.length }} {{ t('explore.messages') }}</span>
                </div>
              </div>
              <button class="conv-delete" @click.stop="deleteConversation(conv.id)">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 归档对话 -->
        <div v-if="archivedConversations.length > 0" class="conversation-group archived">
          <div class="group-header" @click="toggleGroup('archived')">
            <svg
              class="collapse-icon"
              :class="{ collapsed: collapsedGroups.includes('archived') }"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="group-label">{{ t('explore.archived') }}</span>
            <span class="group-count">{{ archivedConversations.length }}</span>
          </div>

          <div v-show="!collapsedGroups.includes('archived')" class="group-items">
            <div
              v-for="conv in archivedConversations"
              :key="conv.id"
              class="conversation-item archived"
              @click="selectConversation(conv.id)"
            >
              <div class="conv-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="conv-info">
                <div class="conv-title">{{ conv.title }}</div>
                <div class="conv-meta">{{ formatTime(conv.updatedAt) }}</div>
              </div>
              <button class="conv-restore" @click.stop="restoreConversation(conv.id)">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M3 12H8M3 12V7M3 12V17"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="groupedConversations.length === 0 && archivedConversations.length === 0"
          class="empty-sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p>{{ t('explore.noConversations') }}</p>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="explore-main">
      <!-- 有活动对话时显示消息 -->
      <template v-if="activeConversation">
        <!-- 消息列表 -->
        <div class="message-list" ref="messageListRef">
          <div
            v-for="message in activeConversation.messages"
            :key="message.id"
            class="message-item"
            :class="`message-${message.role}`"
          >
            <div class="message-avatar">
              <div v-if="message.role === 'user'" class="avatar user-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" />
                  <path
                    d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div v-else class="avatar assistant-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                  <path
                    d="M12 6V12L16 14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div class="message-body">
              <div class="message-header">
                <span class="message-name">{{
                  message.role === 'user' ? t('explore.me') : t('explore.assistant')
                }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>

              <!-- 文件附件 -->
              <div
                v-if="message.attachments && message.attachments.length > 0"
                class="message-attachments"
              >
                <div
                  v-for="attachment in message.attachments"
                  :key="attachment.id"
                  class="attachment-item"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>{{ attachment.name }}</span>
                </div>
              </div>

              <!-- 消息内容 -->
              <div class="message-content" v-html="renderMarkdown(message.content)"></div>

              <!-- 动态组件 -->
              <div
                v-if="message.components && message.components.length > 0"
                class="message-components"
              >
                <component
                  v-for="component in message.components"
                  :key="component.id"
                  :is="getComponentRenderer(component.type)"
                  :config="component"
                  @event="handleComponentEvent(message.id, $event)"
                />
              </div>

              <!-- 消息操作 -->
              <div v-if="message.role === 'assistant'" class="message-actions">
                <button
                  class="action-btn"
                  @click="copyMessage(message.content)"
                  :title="t('explore.copy')"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <path
                      d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                </button>
                <button
                  class="action-btn"
                  @click="regenerateMessage(message.id)"
                  :title="t('explore.regenerate')"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M1 4V10H7"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M23 20V14H17"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 正在输入指示器 -->
          <div v-if="isGenerating" class="message-item message-assistant">
            <div class="message-avatar">
              <div class="avatar assistant-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                  <path
                    d="M12 6V12L16 14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div class="message-body">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <!-- 附件预览 -->
          <div v-if="pendingAttachments.length > 0" class="attachments-preview">
            <div v-for="(file, index) in pendingAttachments" :key="index" class="preview-item">
              <span>{{ file.name }}</span>
              <button @click="removeAttachment(index)">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="input-wrapper">
            <button class="attach-btn" @click="triggerFileUpload" :title="t('explore.attachFile')">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59718 21.9983 8.005 21.9983C6.41282 21.9983 4.88584 21.3658 3.76 20.24C2.63416 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63416 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42975 14.0991 2.00606 15.16 2.00606C16.2209 2.00606 17.2394 2.42975 17.99 3.18C18.7403 3.93064 19.1639 4.94913 19.1639 6.01C19.1639 7.07087 18.7403 8.08936 17.99 8.84L9.41 17.41C9.03472 17.7853 8.52573 17.9956 7.995 17.9956C7.46427 17.9956 6.95528 17.7853 6.58 17.41C6.20472 17.0347 5.99445 16.5257 5.99445 15.995C5.99445 15.4643 6.20472 14.9553 6.58 14.58L15.07 6.1"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <input ref="fileInputRef" type="file" multiple hidden @change="handleFileUpload" />

            <textarea
              v-model="inputMessage"
              class="message-textarea"
              :placeholder="t('explore.inputPlaceholder')"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift.exact="inputMessage += '\n'"
              rows="1"
              ref="textareaRef"
            ></textarea>

            <button class="send-btn" @click="sendMessage" :disabled="!canSend">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <div class="input-hint">
            {{ t('explore.inputHint') }}
          </div>
        </div>
      </template>

      <!-- 没有活动对话时显示模板选择 -->
      <template v-else>
        <div class="template-view">
          <div class="template-header">
            <h2>{{ t('explore.selectTemplate') }}</h2>
            <p>{{ t('explore.selectTemplateDesc') }}</p>
          </div>

          <div class="template-grid">
            <div
              v-for="template in templates"
              :key="template.id"
              class="template-card"
              @click="useTemplate(template)"
            >
              <div class="template-icon">{{ template.icon }}</div>
              <div class="template-info">
                <h3>{{ template.name }}</h3>
                <p class="template-desc">{{ template.description }}</p>
                <ul class="template-features">
                  <li v-for="(feature, index) in template.features.slice(0, 2)" :key="index">
                    {{ feature }}
                  </li>
                </ul>
              </div>
              <button class="use-template-btn">{{ t('explore.useTemplate') }}</button>
            </div>
          </div>

          <div class="direct-input">
            <div class="direct-input-wrapper">
              <textarea
                v-model="directInput"
                class="direct-input-textarea"
                :placeholder="t('explore.directInputPlaceholder')"
                @keydown.enter.exact.prevent="startDirectChat"
              ></textarea>
              <button
                class="direct-send-btn"
                @click="startDirectChat"
                :disabled="!directInput.trim()"
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick, onMounted } from 'vue'
  import { useExploreStore } from '@/store'
  import { useI18n } from 'vue-i18n'
  import type { ChatTemplate, MessageAttachment } from '@/types'

  const { t } = useI18n()
  const exploreStore = useExploreStore()

  // Refs
  const messageListRef = ref<HTMLElement | null>(null)
  const textareaRef = ref<HTMLTextAreaElement | null>(null)
  const fileInputRef = ref<HTMLInputElement | null>(null)

  // State
  const inputMessage = ref('')
  const directInput = ref('')
  const searchQuery = ref('')
  const collapsedGroups = ref<string[]>([])
  const pendingAttachments = ref<File[]>([])
  const isGenerating = ref(false)

  // Computed
  const activeConversationId = computed(() => exploreStore.activeConversationId)
  const activeConversation = computed(() => exploreStore.activeConversation)
  const groupedConversations = computed(() => exploreStore.groupedConversations)
  const archivedConversations = computed(() => exploreStore.archivedConversations)
  const templates = computed(() => exploreStore.allTemplates)
  const canSend = computed(() => inputMessage.value.trim() || pendingAttachments.value.length > 0)

  // Watchers
  watch(searchQuery, (query) => {
    exploreStore.setSearchQuery(query)
  })

  watch(
    () => activeConversation.value?.messages.length,
    () => {
      nextTick(() => {
        scrollToBottom()
      })
    }
  )

  // Methods
  const createNewChat = () => {
    exploreStore.createConversation()
    inputMessage.value = ''
    pendingAttachments.value = []
  }

  const selectConversation = (id: string) => {
    exploreStore.setActiveConversation(id)
  }

  const deleteConversation = (id: string) => {
    if (confirm(t('explore.confirmDelete'))) {
      exploreStore.deleteConversation(id)
    }
  }

  const restoreConversation = (id: string) => {
    exploreStore.unarchiveConversation(id)
  }

  const toggleGroup = (key: string) => {
    const index = collapsedGroups.value.indexOf(key)
    if (index > -1) {
      collapsedGroups.value.splice(index, 1)
    } else {
      collapsedGroups.value.push(key)
    }
  }

  const useTemplate = (template: ChatTemplate) => {
    exploreStore.createConversation({
      templateId: template.id,
      initialMessage: template.initialPrompt
    })
  }

  const startDirectChat = () => {
    if (!directInput.value.trim()) return

    exploreStore.createConversation({
      initialMessage: directInput.value.trim()
    })
    directInput.value = ''
  }

  const sendMessage = async () => {
    if (!canSend.value || !activeConversationId.value || isGenerating.value) return

    const content = inputMessage.value.trim()
    const attachments = pendingAttachments.value

    // 清空输入
    inputMessage.value = ''
    pendingAttachments.value = []

    // 添加用户消息
    const userMessage: any = {
      role: 'user' as const,
      content
    }

    // 处理附件
    if (attachments.length > 0) {
      userMessage.attachments = await Promise.all(
        attachments.map(async (file) => {
          const attachment: MessageAttachment = {
            id: `attach-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size
          }

          // 如果是图片，转换为 base64
          if (file.type.startsWith('image/')) {
            attachment.base64 = await fileToBase64(file)
          }

          return attachment
        })
      )
    }

    exploreStore.addMessage(activeConversationId.value, userMessage)

    // 模拟 AI 回复
    isGenerating.value = true

    setTimeout(() => {
      if (activeConversationId.value) {
        exploreStore.addMessage(activeConversationId.value, {
          role: 'assistant',
          content: getSimulatedResponse(content)
        })
      }
      isGenerating.value = false
    }, 1500)
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })
  }

  const triggerFileUpload = () => {
    fileInputRef.value?.click()
  }

  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
      pendingAttachments.value = [...pendingAttachments.value, ...Array.from(target.files)]
    }
    target.value = ''
  }

  const removeAttachment = (index: number) => {
    pendingAttachments.value.splice(index, 1)
  }

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // 可以添加 toast 提示
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const regenerateMessage = (messageId: string) => {
    // TODO: 实现重新生成逻辑
    console.log('Regenerate message:', messageId)
  }

  const handleComponentEvent = (messageId: string, event: any) => {
    console.log('Component event:', messageId, event)
  }

  const getComponentRenderer = (type: string) => {
    // TODO: 返回对应的动态组件
    return 'div'
  }

  const renderMarkdown = (content: string): string => {
    // TODO: 实现 Markdown 渲染
    return content.replace(/\n/g, '<br>')
  }

  const getSimulatedResponse = (userMessage: string): string => {
    const responses = [
      `我理解您想要"${userMessage.slice(0, 30)}..."。让我来帮您分析这个问题。`,
      `这是一个很好的问题！关于"${userMessage.slice(0, 20)}..."，我有以下几点建议：`,
      `感谢您的提问。基于您的需求，我为您准备了以下方案。`,
      `好的，我来处理这个请求。请稍等，我正在分析和生成响应。`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const scrollToBottom = () => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  }

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return t('explore.justNow')
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${t('explore.minutesAgo')}`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${t('explore.hoursAgo')}`
    if (diff < 172800000) return t('explore.yesterday')

    return date.toLocaleDateString('zh-CN')
  }

  // Auto-resize textarea
  const autoResize = () => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
    }
  }

  watch(inputMessage, () => {
    nextTick(autoResize)
  })

  onMounted(() => {
    autoResize()
  })
</script>

<style scoped lang="scss">
  @import './explore-view.scss';
</style>
