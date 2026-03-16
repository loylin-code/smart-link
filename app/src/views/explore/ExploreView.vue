<template>
  <div class="explore-view">
    <!-- 左侧边栏 -->
    <aside class="explore-sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <!-- 侧边栏内容 -->
      <div class="sidebar-content" v-show="!isSidebarCollapsed">
        <!-- 顶部标题栏 -->
        <div class="sidebar-title-bar">
          <h2 class="sidebar-title">{{ t('explore.chat') }}</h2>
          <button class="collapse-btn" @click="toggleSidebar" :title="t('sidebar.collapseSidebar')">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M11 19L5 12L11 5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M19 19L13 12L19 5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <!-- 新建对话按钮 -->
        <div class="sidebar-actions">
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

      <!-- 收起状态下的展开按钮 -->
      <button
        v-if="isSidebarCollapsed"
        class="expand-btn"
        @click="toggleSidebar"
        :title="t('sidebar.collapseSidebar')"
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M13 19L19 12L13 5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M5 19L11 12L5 5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </aside>

    <!-- 主内容区 -->
    <main class="explore-main">
      <!-- 有活动对话时显示消息 -->
      <template v-if="activeConversation">
        <!-- 聊天视图 -->
        <div class="chat-view">
          <!-- 对话头部 -->
          <header class="chat-header">
            <div class="header-info">
              <h2 class="conversation-title">
                {{ activeConversation.title || t('explore.newChat') }}
              </h2>
              <span class="message-count">
                {{ activeConversation.messages.length }} {{ t('explore.messages') }}
              </span>
            </div>
            <div class="header-actions">
              <button class="header-btn" @click="createNewChat" :title="t('explore.newChat')">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button class="close-btn" @click="closeConversation" :title="t('explore.close')">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </header>

          <!-- 消息列表 -->
          <div class="message-list" ref="messageListRef">
            <div
              v-for="(message, index) in activeConversation.messages"
              :key="message.id"
              class="message-item"
              :class="`message-${message.role}`"
              :style="{ animationDelay: `${index * 0.1}s` }"
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
                  <span class="online-dot"></span>
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
                    v-bind="component.props"
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
            <div v-if="isGenerating" class="message-item message-assistant typing">
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
                  <span class="online-dot"></span>
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
              <button
                class="attach-btn"
                @click="triggerFileUpload"
                :title="t('explore.attachFile')"
              >
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
        </div>
      </template>

      <!-- 没有活动对话时显示欢迎页 -->
      <template v-else>
        <div class="welcome-view">
          <div class="welcome-content">
            <div class="welcome-header">
              <div class="welcome-icon">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                  <path
                    d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"
                  />
                </svg>
              </div>
              <h1 class="welcome-title">{{ t('explore.welcomeTitle') }}</h1>
              <p class="welcome-subtitle">{{ t('explore.welcomeSubtitle') }}</p>
            </div>

            <!-- 快速建议 -->
            <div class="quick-suggestions">
              <div class="suggestion-chips">
                <button
                  v-for="suggestion in quickSuggestions"
                  :key="suggestion.id"
                  class="chip"
                  @click="useQuickSuggestion(suggestion.text)"
                >
                  {{ suggestion.icon }} {{ suggestion.text }}
                </button>
              </div>
            </div>

            <!-- 模板卡片 -->
            <div class="template-grid">
              <div
                v-for="(template, index) in templates.slice(0, 4)"
                :key="template.id"
                class="template-card"
                :style="{ animationDelay: `${index * 0.1}s` }"
                @click="useTemplate(template)"
              >
                <div class="template-header">
                  <span class="template-icon">{{ template.icon }}</span>
                  <h3 class="template-name">{{ template.name }}</h3>
                </div>
                <p class="template-desc">{{ template.description }}</p>
              </div>
            </div>
          </div>

          <!-- 底部输入框 -->
          <div class="welcome-input-area">
            <div class="input-wrapper">
              <button
                class="attach-btn"
                @click="triggerFileUpload"
                :title="t('explore.attachFile')"
              >
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
                v-model="directInput"
                class="message-textarea"
                :placeholder="t('explore.directInputPlaceholder')"
                @keydown.enter.exact.prevent="startDirectChat"
                rows="1"
              ></textarea>

              <button class="send-btn" @click="startDirectChat" :disabled="!directInput.trim()">
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
            <div class="input-hint">{{ t('explore.inputHint') }}</div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick, onMounted, markRaw } from 'vue'
  import { useExploreStore } from '@/store'
  import { useI18n } from 'vue-i18n'
  import type { ChatTemplate, MessageAttachment } from '@/types'

  // 引入聊天组件
  import ChartCard from '@/components/chat/ChartCard.vue'
  import ConfirmDialog from '@/components/chat/ConfirmDialog.vue'
  import TrendAnalysis from '@/components/chat/TrendAnalysis.vue'
  import DataSummary from '@/components/chat/DataSummary.vue'

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
  const isSidebarCollapsed = ref(false)

  // 快速建议
  const quickSuggestions = [
    { id: '1', icon: '💡', text: t('explore.suggestion1') },
    { id: '2', icon: '📊', text: t('explore.suggestion2') },
    { id: '3', icon: '🎨', text: t('explore.suggestion3') },
    { id: '4', icon: '🔧', text: t('explore.suggestion4') }
  ]

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
  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  const closeConversation = () => {
    exploreStore.setActiveConversation(null)
  }

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

  const useTemplate = async (template: ChatTemplate) => {
    // 创建对话
    const conversation = await exploreStore.createConversation({
      templateId: template.id,
      title: template.name
    })

    if (conversation) {
      // 自动发送模板的初始提示
      await sendUserMessage(template.initialPrompt, conversation.id)
    }
  }

  const useQuickSuggestion = async (text: string) => {
    // 创建对话并发送消息
    const conversation = await exploreStore.createConversation({
      title: text.slice(0, 30)
    })

    if (conversation) {
      await sendUserMessage(text, conversation.id)
    }
  }

  const startDirectChat = async () => {
    if (!directInput.value.trim()) return

    const message = directInput.value.trim()
    directInput.value = ''

    // 创建对话并发送消息
    const conversation = await exploreStore.createConversation({
      title: message.slice(0, 30)
    })

    if (conversation) {
      await sendUserMessage(message, conversation.id)
    }
  }

  const sendUserMessage = async (content: string, conversationId: string) => {
    // 添加用户消息
    exploreStore.addMessage(conversationId, {
      role: 'user',
      content
    })

    // 模拟 AI 回复
    isGenerating.value = true

    setTimeout(() => {
      const response = getSimulatedResponse(content)
      exploreStore.addMessage(conversationId, {
        role: 'assistant',
        content: response.content,
        components: response.components
      })
      isGenerating.value = false
      scrollToBottom()
    }, 1000)
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
        const response = getSimulatedResponse(content)
        exploreStore.addMessage(activeConversationId.value, {
          role: 'assistant',
          content: response.content,
          components: response.components
        })
      }
      isGenerating.value = false
      scrollToBottom()
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
    const componentMap: Record<string, any> = {
      chart: markRaw(ChartCard),
      confirm: markRaw(ConfirmDialog),
      'trend-analysis': markRaw(TrendAnalysis),
      'data-summary': markRaw(DataSummary)
    }
    return componentMap[type] || 'div'
  }

  const renderMarkdown = (content: string): string => {
    // TODO: 实现 Markdown 渲染
    return content.replace(/\n/g, '<br>')
  }

  const getSimulatedResponse = (userMessage: string): { content: string; components?: any[] } => {
    const msg = userMessage.toLowerCase()

    // 智能体使用情况
    if (
      msg.includes('智能体') &&
      (msg.includes('使用') || msg.includes('情况') || msg.includes('分析'))
    ) {
      return {
        content: '📊 **智能体使用分析报告**\n\n根据最近的数据统计，以下是关键指标：',
        components: [
          {
            id: `comp-${Date.now()}-1`,
            type: 'data-summary',
            props: {
              title: '核心指标概览',
              status: 'success',
              items: [
                {
                  icon: '🤖',
                  label: '活跃智能体',
                  value: '12',
                  unit: '个',
                  change: '↑ 2',
                  changeClass: 'positive'
                },
                {
                  icon: '📞',
                  label: '总调用次数',
                  value: '1,234',
                  unit: '次',
                  change: '↑ 15%',
                  changeClass: 'positive'
                },
                {
                  icon: '⚡',
                  label: '平均响应',
                  value: '1.2',
                  unit: '秒',
                  change: '↓ 0.3s',
                  changeClass: 'positive'
                },
                {
                  icon: '✅',
                  label: '成功率',
                  value: '98.5',
                  unit: '%',
                  change: '稳定',
                  changeClass: 'neutral'
                }
              ],
              description: '数据更新时间：刚刚'
            }
          }
        ]
      }
    }

    // 资源/容量查询
    if (msg.includes('资源') || msg.includes('容量') || msg.includes('查询')) {
      return {
        content: '📈 **资源使用情况**\n\n当前系统资源状态良好：',
        components: [
          {
            id: `comp-${Date.now()}-2`,
            type: 'trend-analysis',
            props: {
              title: '资源使用趋势',
              summaries: [
                {
                  label: 'CPU 使用率',
                  value: '45%',
                  change: '正常',
                  trend: 'flat',
                  color: '#10b981'
                },
                { label: '内存使用', value: '68%', change: '↑ 5%', trend: 'up', color: '#f59e0b' },
                { label: '磁盘空间', value: '52%', change: '充足', trend: 'flat', color: '#3b82f6' }
              ],
              chartData: [42, 45, 48, 44, 46, 45, 45],
              chartLabels: ['1h前', '50分', '40分', '30分', '20分', '10分', '现在'],
              insights: [
                { type: 'positive', text: 'CPU 使用率稳定在 45% 左右，运行状态良好' },
                { type: 'neutral', text: '内存使用略有上升，建议关注' },
                { type: 'positive', text: '磁盘空间充足，无需清理' }
              ]
            }
          }
        ]
      }
    }

    // 创建智能体
    if (msg.includes('创建') && msg.includes('智能体')) {
      return {
        content: '好的，我可以帮您创建新的智能体。请确认以下配置：',
        components: [
          {
            id: `comp-${Date.now()}-3`,
            type: 'confirm',
            props: {
              title: '确认创建智能体',
              description: '将使用以下默认配置创建新的智能体',
              variant: 'info',
              items: ['名称：新智能体', '模型：GPT-4o', '类型：通用助手', '自动保存：开启'],
              confirmText: '确认创建',
              cancelText: '修改配置'
            }
          }
        ]
      }
    }

    // 模型配置
    if (msg.includes('模型') && (msg.includes('配置') || msg.includes('设置'))) {
      return {
        content: '📊 **当前模型使用分布**\n\n各模型调用占比：',
        components: [
          {
            id: `comp-${Date.now()}-4`,
            type: 'chart',
            props: {
              title: '模型使用占比',
              type: 'pie',
              data: [45, 30, 15, 10],
              labels: ['GPT-4o', 'Claude 3.5', '通义千问', 'Gemini'],
              legend: ['GPT-4o', 'Claude', '通义', 'Gemini']
            }
          }
        ]
      }
    }

    // 数据分析
    if (msg.includes('数据') && msg.includes('分析')) {
      return {
        content: '📈 **数据分析报告**\n\n根据您的数据，我为您生成以下分析：',
        components: [
          {
            id: `comp-${Date.now()}-5`,
            type: 'trend-analysis',
            props: {
              title: '数据趋势分析',
              summaries: [
                { label: '总量', value: '8.5K', change: '↑ 23%', trend: 'up', color: '#3b82f6' },
                { label: '平均值', value: '1,214', change: '↑ 15%', trend: 'up', color: '#10b981' },
                { label: '峰值', value: '1,580', change: '周三', trend: 'up', color: '#8b5cf6' }
              ],
              chartData: [820, 932, 1580, 934, 1290, 1330, 1120],
              chartLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
              insights: [
                { type: 'positive', text: '整体数据呈上升趋势，增长 23%' },
                { type: 'neutral', text: '周三达到峰值 1,580' },
                { type: 'positive', text: '周末数据略有回落' }
              ]
            }
          }
        ]
      }
    }

    // 客服相关
    if (msg.includes('客服') || msg.includes('服务')) {
      return {
        content: '🤖 **智能客服功能介绍**\n\n智能客服可以帮助您：',
        components: [
          {
            id: `comp-${Date.now()}-6`,
            type: 'data-summary',
            props: {
              title: '客服功能概览',
              status: 'info',
              items: [
                { icon: '💬', label: '自动回复', value: '7x24', unit: '小时' },
                { icon: '📚', label: '知识库', value: '500+', unit: '条' },
                { icon: '🔄', label: '转人工', value: '智能', unit: '判断' },
                { icon: '⭐', label: '满意度', value: '95', unit: '%' }
              ],
              description: '支持多渠道接入：网页、微信、APP'
            }
          }
        ]
      }
    }

    // 默认回复
    return {
      content: `我理解您想要了解"${userMessage.slice(0, 30)}..."。让我来帮您分析这个问题。\n\n请问您需要更详细的信息吗？`,
      components: undefined
    }
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
