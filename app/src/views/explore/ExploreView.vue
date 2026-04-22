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
                    <span>{{ conv.messageCount || conv.messages.length }} {{ t('explore.messages') }}</span>
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
                {{ activeConversation.messageCount || activeConversation.messages.length }} {{ t('explore.messages') }}
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

                <!-- 消息内容 - 使用 MarkdownWithCharts 组件 -->
                <div class="message-content">
                  <MarkdownWithCharts
                    :content="message.content"
                    :streaming="message.isStreaming"
                    @chart-click="handleChartClick"
                  />
                </div>

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

              <!-- 测试按钮：仅开发环境显示 -->
              <button
                v-if="import.meta.env.DEV"
                class="test-btn"
                @click="injectTestChartMessage"
                title="注入测试图表消息"
              >
                📊
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

    <!-- 右侧 Tab 面板 -->
    <aside v-if="tabManager.getTabCount() > 0" class="explore-tabs">
      <TabPanel :manager="tabManager" @tab-close="handleTabClose" />
    </aside>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick, onMounted, markRaw } from 'vue'
  import { useExploreStore } from '@/store'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import type { ChatTemplate } from '@/types'

  // 引入聊天组件
  import ChartCard from '@/components/chat/ChartCard.vue'
  import ConfirmDialog from '@/components/chat/ConfirmDialog.vue'
  import TrendAnalysis from '@/components/chat/TrendAnalysis.vue'
  import DataSummary from '@/components/chat/DataSummary.vue'

  // 引入 UI 组件库
  import { SlStatCard, SlChart, SlTable, SlProgress } from '@smart-link/ui'

  // 引入 chat-vis 组件
  import { MarkdownWithCharts, TabPanel, TabManager } from '@smart-link/chat-vis'
  import type { VisConfig } from '@smart-link/chat-vis'
  import ChartDetail from '@smart-link/chat-vis/tabs/templates/ChartDetail.vue'

  const { t } = useI18n()
  const exploreStore = useExploreStore()
  const router = useRouter()

  // Refs
  const messageListRef = ref<HTMLElement | null>(null)
  const textareaRef = ref<HTMLTextAreaElement | null>(null)
  const fileInputRef = ref<HTMLInputElement | null>(null)

  // TabManager instance
  const tabManager = ref<TabManager>(new TabManager())

  // Register chart-detail template on mount
  onMounted(() => {
    tabManager.value.registerTemplate({
      id: 'chart-detail',
      name: '图表详情',
      component: markRaw(ChartDetail)
    })
    autoResize()
    // 从后端加载对话列表
    exploreStore.fetchConversations()
  })

  // State
  const inputMessage = ref('')
  const directInput = ref('')
  const searchQuery = ref('')
  const collapsedGroups = ref<string[]>([])
  const pendingAttachments = ref<File[]>([])
  const isSidebarCollapsed = ref(false)

  // SSE streaming state (sync with store)
  const isGenerating = computed(() => exploreStore.isCurrentlyStreaming())

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

    // 使用 SSE 流式接口发送消息
    // 默认使用探索中心的通用助手 Agent
    // TODO: 可以从配置或用户选择获取 agentId
    const defaultAgentId = 'explore-assistant'

    try {
      await exploreStore.sendSSEMessage(content, defaultAgentId, conversationId)
    } catch (error) {
      console.error('SSE message failed:', error)
      // 添加错误提示
      exploreStore.addMessage(conversationId, {
        role: 'assistant',
        content: '抱歉，消息发送失败，请稍后重试。'
      })
    } finally {
      scrollToBottom()
    }
  }

  const sendMessage = async () => {
    if (!canSend.value || !activeConversationId.value || isGenerating.value) return

    const content = inputMessage.value.trim()
    const attachments = pendingAttachments.value

    // 清空输入
    inputMessage.value = ''
    pendingAttachments.value = []

    // 处理附件（TODO: 暂不支持附件，后续扩展）
    if (attachments.length > 0) {
      // 附件处理逻辑
      console.warn('Attachments not supported in SSE mode yet')
    }

    // 使用 SSE 流式接口
    // 默认 Agent ID
    const defaultAgentId = 'explore-assistant'

    try {
      await exploreStore.sendSSEMessage(content, defaultAgentId, activeConversationId.value)
    } catch (error) {
      console.error('SSE message failed:', error)
      if (activeConversationId.value) {
        exploreStore.addMessage(activeConversationId.value, {
          role: 'assistant',
          content: '抱歉，消息发送失败，请稍后重试。'
        })
      }
    } finally {
      scrollToBottom()
    }
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

  interface ComponentEventPayload {
    name: string
    action: 'sendMessage' | 'navigate' | 'callback'
    payload?: Record<string, any>
  }

  const handleComponentEvent = (messageId: string, event: ComponentEventPayload) => {
    const { action, payload } = event

    switch (action) {
      case 'sendMessage':
        // 将 payload.template 中的变量替换后发送新消息
        if (payload?.template) {
          const template = payload.template
          const message = template.replace(
            /\{(\w+)\}/g,
            (_: string, key: string) => payload[key as keyof typeof payload] || ''
          )
          if (activeConversationId.value) {
            sendUserMessage(message, activeConversationId.value)
          }
        } else if (payload?.message) {
          if (activeConversationId.value) {
            sendUserMessage(payload.message, activeConversationId.value)
          }
        }
        break

      case 'navigate':
        if (payload?.path) {
          router.push(payload.path)
        }
        break

      case 'callback':
        // 自定义回调（可扩展）
        console.log('[ExploreView] Component callback:', payload)
        break

      default:
        console.warn('[ExploreView] Unknown component action:', action)
    }
  }

  const getComponentRenderer = (type: string) => {
    // 1. 现有聊天组件（保持兼容）
    const chatComponents: Record<string, any> = {
      chart: markRaw(ChartCard),
      confirm: markRaw(ConfirmDialog),
      'trend-analysis': markRaw(TrendAnalysis),
      'data-summary': markRaw(DataSummary)
    }

    // 2. UI 组件库映射
    const uiComponents: Record<string, any> = {
      SlStatCard: markRaw(SlStatCard),
      SlChart: markRaw(SlChart),
      SlTable: markRaw(SlTable),
      SlProgress: markRaw(SlProgress),
      // 别名映射（支持简写）
      'stat-card': markRaw(SlStatCard),
      statcard: markRaw(SlStatCard),
      table: markRaw(SlTable),
      progress: markRaw(SlProgress)
    }

    // 3. 合并查找（聊天组件优先，保持向后兼容）
    return chatComponents[type] || uiComponents[type] || uiComponents[`Sl${type}`] || 'div'
  }

  const handleChartClick = (config: VisConfig) => {
    // Open tab with chart detail view
    tabManager.value.openTab(
      config.detailTemplate || 'chart-detail',
      config,
      { title: config.title || '图表详情' }
    )
  }

  // 测试：注入包含图表配置的消息（仅开发环境）
  const injectTestChartMessage = async () => {
    let convId = activeConversationId.value

    if (!convId) {
      // 如果没有活跃对话，先创建一个
      const newConv = await exploreStore.createConversation({ title: '测试图表渲染' })
      convId = newConv?.id
    }

    if (!convId) return

    // 添加用户消息
    exploreStore.addMessage(convId, {
      role: 'user',
      content: '请帮我分析销售数据'
    })

    // 添加包含图表的AI回复
    const chartContent = `根据您提供的销售数据，我生成了以下分析图表：

\`\`\`chart-json
{
  "type": "line",
  "title": "月度销售趋势",
  "data": [
    { "month": "1月", "sales": 12000 },
    { "month": "2月", "sales": 15000 },
    { "month": "3月", "sales": 18000 },
    { "month": "4月", "sales": 22000 },
    { "month": "5月", "sales": 25000 },
    { "month": "6月", "sales": 28000 }
  ],
  "xField": "month",
  "yField": "sales",
  "smooth": true
}
\`\`\`

从图表可以看出，销售额呈现持续上升趋势，6月达到峰值28000元。

\`\`\`chart-json
{
  "type": "pie",
  "title": "产品类别占比",
  "data": [
    { "category": "电子产品", "value": 35 },
    { "category": "服装", "value": 25 },
    { "category": "食品", "value": 20 },
    { "category": "家居", "value": 15 },
    { "category": "其他", "value": 5 }
  ],
  "angleField": "value",
  "colorField": "category"
}
\`\`\`

电子产品占比最高，建议重点关注该品类的库存管理。`

    exploreStore.addMessage(convId, {
      role: 'assistant',
      content: chartContent
    })

    scrollToBottom()
  }

  const handleTabClose = () => {
    // Tab closed, update view if needed
    nextTick(() => {
      // Re-evaluate tab count for v-if condition
    })
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
</script>

<style scoped lang="scss">
  @import './explore-view.scss';
</style>
