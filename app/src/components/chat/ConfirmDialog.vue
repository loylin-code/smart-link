<template>
  <div v-if="title" class="confirm-dialog" :class="{ 'confirm-dialog--resolved': resolved }">
    <div class="confirm-header">
      <div class="confirm-icon" :class="`confirm-icon--${variant}`">
        <svg v-if="variant === 'warning'" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9V11M12 15H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg v-else-if="variant === 'info'" viewBox="0 0 24 24" fill="none">
          <path
            d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg v-else-if="variant === 'success'" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none">
          <path
            d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="confirm-info">
        <span class="confirm-title">{{ title }}</span>
        <span v-if="description" class="confirm-desc">{{ description }}</span>
      </div>
    </div>

    <div v-if="!resolved" class="confirm-body">
      <div v-if="items && items.length > 0" class="confirm-items">
        <div v-for="(item, index) in items" :key="index" class="confirm-item">
          <span class="item-bullet">•</span>
          <span>{{ item }}</span>
        </div>
      </div>
    </div>

    <div class="confirm-footer">
      <template v-if="!resolved">
        <button class="confirm-btn confirm-btn--secondary" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button class="confirm-btn confirm-btn--primary" @click="handleConfirm">
          {{ confirmText }}
        </button>
      </template>
      <template v-else>
        <div class="confirm-resolved">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ resolvedText }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  interface Props {
    title: string
    description?: string
    variant?: 'warning' | 'info' | 'success' | 'danger'
    items?: string[]
    confirmText?: string
    cancelText?: string
    resolvedText?: string
  }

  withDefaults(defineProps<Props>(), {
    variant: 'info',
    confirmText: '确认',
    cancelText: '取消',
    resolvedText: '已确认'
  })

  const resolved = ref(false)
  const emit = defineEmits<{
    (e: 'event', data: { type: string; action: string; data?: any }): void
  }>()

  const handleConfirm = () => {
    resolved.value = true
    emit('event', { type: 'confirm', action: 'confirmed' })
  }

  const handleCancel = () => {
    emit('event', { type: 'confirm', action: 'cancelled' })
  }
</script>

<style scoped lang="scss">
  .confirm-dialog {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    margin: 8px 0;

    &--resolved {
      background: #f0fdf4;
      border-color: #86efac;
    }
  }

  .confirm-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
  }

  .confirm-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 20px;
      height: 20px;
    }

    &--warning {
      background: #fef3c7;
      color: #f59e0b;
    }

    &--info {
      background: #dbeafe;
      color: #3b82f6;
    }

    &--success {
      background: #d1fae5;
      color: #10b981;
    }

    &--danger {
      background: #fee2e2;
      color: #ef4444;
    }
  }

  .confirm-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .confirm-title {
    font-weight: 600;
    color: #1f2937;
  }

  .confirm-desc {
    font-size: 13px;
    color: #6b7280;
  }

  .confirm-body {
    padding: 16px;
  }

  .confirm-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .confirm-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    color: #4b5563;
  }

  .item-bullet {
    color: #9ca3af;
  }

  .confirm-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    background: #f9fafb;
  }

  .confirm-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &--primary {
      background: #3b82f6;
      border: none;
      color: #fff;

      &:hover {
        background: #2563eb;
      }
    }

    &--secondary {
      background: #fff;
      border: 1px solid #d1d5db;
      color: #4b5563;

      &:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
      }
    }
  }

  .confirm-resolved {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #16a34a;
    font-size: 13px;
    font-weight: 500;

    svg {
      width: 18px;
      height: 18px;
    }
  }
</style>
