<template>
  <Teleport to="body">
    <Transition name="message">
      <div v-if="visible" class="sl-message" :class="[`is-${type}`]">
        <span class="sl-message__icon">
          <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13L9 17L19 7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path
              d="M15 9L9 15M9 9L15 15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path
              d="M12 16V12M12 8H12.01"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="sl-message__text">{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  interface Props {
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
    duration?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'info',
    duration: 3000
  })

  const visible = ref(false)

  onMounted(() => {
    visible.value = true
    if (props.duration > 0) {
      setTimeout(() => {
        visible.value = false
      }, props.duration)
    }
  })
</script>

<style scoped lang="scss">
  .sl-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #151b3d;
    border: 1px solid #252b4e;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 3000;

    &__icon {
      display: flex;
      align-items: center;

      svg {
        width: 16px;
        height: 16px;
      }
    }

    &__text {
      font-size: 14px;
      color: #fff;
    }

    &.is-success {
      border-color: #10b981;
      .sl-message__icon {
        color: #10b981;
      }
    }

    &.is-error {
      border-color: #ef4444;
      .sl-message__icon {
        color: #ef4444;
      }
    }

    &.is-warning {
      border-color: #f59e0b;
      .sl-message__icon {
        color: #f59e0b;
      }
    }

    &.is-info {
      border-color: #3b82f6;
      .sl-message__icon {
        color: #3b82f6;
      }
    }
  }

  .message-enter-active,
  .message-leave-active {
    transition: all 0.3s ease;
  }

  .message-enter-from,
  .message-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
</style>
