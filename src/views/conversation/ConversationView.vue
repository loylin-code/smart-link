<template>
  <div class="conversation-view">
    <div class="conversation-sidebar">
      <div class="sidebar-header">
        <button class="new-conversation-btn" @click="createNewConversation">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>新建对话</span>
        </button>
      </div>

      <div class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conversation-item"
          :class="{ 'conversation-item--active': activeConversationId === conv.id }"
          @click="selectConversation(conv.id)"
        >
          <div class="conversation-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="conversation-info">
            <div class="conversation-title">{{ conv.title }}</div>
            <div class="conversation-time">{{ formatTime(conv.updatedAt) }}</div>
          </div>
          <button class="conversation-delete" @click.stop="deleteConversation(conv.id)">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="conversation-main">
      <div v-if="activeConversation" class="conversation-content">
        <div class="message-list">
          <div
            v-for="message in activeConversation.messages"
            :key="message.id"
            class="message-item"
            :class="`message-item--${message.role}`"
          >
            <div class="message-avatar">
              <div v-if="message.role === 'user'" class="avatar user-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div v-else class="avatar assistant-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-name">{{ message.role === 'user' ? '我' : 'SmartLink' }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-text">{{ message.content }}</div>
            </div>
          </div>
        </div>

        <div class="message-input-area">
          <div class="input-wrapper">
            <textarea
              v-model="inputMessage"
              class="message-input"
              placeholder="输入消息..."
              @keydown.enter.exact.prevent="sendMessage"
              rows="1"
            ></textarea>
            <button class="send-button" @click="sendMessage" :disabled="!inputMessage.trim()">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="empty-text">选择或创建一个对话开始聊天</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useConversationStore } from '@/store'

const conversationStore = useConversationStore()

const inputMessage = ref('')

const conversations = computed(() => conversationStore.conversationList)
const activeConversationId = computed(() => conversationStore.activeConversationId)
const activeConversation = computed(() => conversationStore.activeConversation)

const createNewConversation = () => {
  conversationStore.createConversation()
}

const selectConversation = (id: string) => {
  conversationStore.setActiveConversation(id)
}

const deleteConversation = (id: string) => {
  conversationStore.deleteConversation(id)
}

const sendMessage = () => {
  if (!inputMessage.value.trim() || !activeConversationId.value) return

  conversationStore.addMessage(activeConversationId.value, {
    role: 'user',
    content: inputMessage.value
  })

  // 模拟AI回复
  setTimeout(() => {
    conversationStore.addMessage(activeConversationId.value!, {
      role: 'assistant',
      content: '这是一个模拟的AI回复。在实际应用中，这里会调用后端API获取真实的AI响应。'
    })
  }, 1000)

  inputMessage.value = ''
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`

  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
.conversation-view {
  height: 100%;
  display: flex;
  background: $bg-primary;
}

.conversation-sidebar {
  width: 300px;
  background: $bg-secondary;
  border-right: 1px solid $bg-elevated;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: $spacing-md;
  border-bottom: 1px solid $bg-elevated;
}

.new-conversation-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  border-radius: $border-radius-md;
  color: $text-primary;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-base ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
  }
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-sm;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-base ease;
  margin-bottom: $spacing-xs;

  &:hover {
    background: $bg-tertiary;

    .conversation-delete {
      opacity: 1;
    }
  }

  &--active {
    background: rgba(0, 212, 255, 0.1);

    .conversation-icon {
      color: $primary-color;
    }
  }
}

.conversation-icon {
  width: 40px;
  height: 40px;
  background: $bg-tertiary;
  border-radius: $border-radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  font-size: $font-size-sm;
  color: $text-primary;
  font-weight: $font-weight-medium;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-time {
  font-size: $font-size-xs;
  color: $text-tertiary;
  margin-top: 2px;
}

.conversation-delete {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-sm;
  color: $text-tertiary;
  opacity: 0;
  transition: all $transition-base ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: $error;
  }
}

.conversation-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.conversation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-lg;
}

.message-item {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
  animation: slideIn 0.3s ease;

  &--user {
    .message-content {
      background: linear-gradient(135deg, $primary-color, $primary-dark);
      color: $text-primary;
    }
  }

  &--assistant {
    .message-content {
      background: $bg-tertiary;
      color: $text-primary;
    }
  }
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-full;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }
}

.user-avatar {
  background: linear-gradient(135deg, $secondary-color, $secondary-dark);
  color: $text-primary;
}

.assistant-avatar {
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  color: $text-primary;
}

.message-content {
  flex: 1;
  padding: $spacing-md;
  border-radius: $border-radius-lg;
  max-width: 70%;
}

.message-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-xs;
}

.message-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
}

.message-time {
  font-size: $font-size-xs;
  opacity: 0.7;
}

.message-text {
  font-size: $font-size-sm;
  line-height: 1.6;
}

.message-input-area {
  padding: $spacing-md $spacing-lg;
  border-top: 1px solid $bg-elevated;
}

.input-wrapper {
  display: flex;
  gap: $spacing-sm;
  background: $bg-secondary;
  border: 1px solid $bg-elevated;
  border-radius: $border-radius-lg;
  padding: $spacing-sm;
  transition: all $transition-base ease;

  &:focus-within {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }
}

.message-input {
  flex: 1;
  background: transparent;
  color: $text-primary;
  font-size: $font-size-sm;
  resize: none;
  padding: $spacing-xs $spacing-sm;

  &::placeholder {
    color: $text-tertiary;
  }
}

.send-button {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  border-radius: $border-radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-primary;
  cursor: pointer;
  transition: all $transition-base ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: $text-tertiary;

  svg {
    width: 100%;
    height: 100%;
  }
}

.empty-text {
  font-size: $font-size-base;
  color: $text-secondary;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
