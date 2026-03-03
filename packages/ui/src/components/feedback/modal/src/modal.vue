<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="sl-modal__wrapper" @click.self="handleClose">
        <div class="sl-modal" :style="{ width }">
          <div class="sl-modal__header">
            <span class="sl-modal__title">{{ title }}</span>
            <button v-if="closable" class="sl-modal__close" @click="handleClose">
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
          <div class="sl-modal__body">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="sl-modal__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { watch } from 'vue'

  interface Props {
    modelValue: boolean
    title?: string
    width?: string
    closable?: boolean
    closeOnClickModal?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    width: '500px',
    closable: true,
    closeOnClickModal: true
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    close: []
  }>()

  const handleClose = () => {
    if (props.closeOnClickModal) {
      emit('update:modelValue', false)
      emit('close')
    }
  }

  watch(
    () => props.modelValue,
    (val) => {
      document.body.style.overflow = val ? 'hidden' : ''
    }
  )
</script>

<style scoped lang="scss">
  .sl-modal {
    &__wrapper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    background: #151b3d;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #252b4e;
    }

    &__title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }

    &__close {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: #b4b9d4;
      transition: all 0.3s ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: #252b4e;
        color: #00d4ff;
      }
    }

    &__body {
      padding: 20px;
      color: #b4b9d4;
    }

    &__footer {
      padding: 12px 20px;
      border-top: 1px solid #252b4e;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;

    .sl-modal {
      transition: transform 0.3s ease;
    }
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;

    .sl-modal {
      transform: scale(0.9);
    }
  }
</style>
