<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="sl-drawer__wrapper" @click.self="handleClose">
        <div class="sl-drawer" :style="drawerStyle">
          <div class="sl-drawer__header">
            <span class="sl-drawer__title">{{ title }}</span>
            <button class="sl-drawer__close" @click="handleClose">
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
          <div class="sl-drawer__body">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="sl-drawer__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed, watch } from 'vue'

  interface Props {
    modelValue: boolean
    title?: string
    size?: string
    placement?: 'left' | 'right'
    closable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    size: '400px',
    placement: 'right',
    closable: true
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    close: []
  }>()

  const drawerStyle = computed(() => ({
    width: props.size,
    [props.placement]: 0
  }))

  const handleClose = () => {
    if (props.closable) {
      emit('update:modelValue', false)
      emit('close')
    }
  }

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  )
</script>

<style scoped lang="scss">
  .sl-drawer {
    &__wrapper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2000;
      display: flex;
      justify-content: flex-end;
    }

    position: absolute;
    top: 0;
    bottom: 0;
    background: #151b3d;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.3);

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
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      color: #fff;
    }

    &__footer {
      padding: 16px 20px;
      border-top: 1px solid #252b4e;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }

  .drawer-enter-active,
  .drawer-leave-active {
    transition: opacity 0.3s ease;

    .sl-drawer {
      transition: transform 0.3s ease;
    }
  }

  .drawer-enter-from,
  .drawer-leave-to {
    opacity: 0;

    .sl-drawer {
      transform: translateX(100%);
    }
  }
</style>
