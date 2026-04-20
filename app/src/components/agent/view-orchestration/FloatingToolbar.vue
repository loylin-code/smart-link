<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useViewStore, type WidthPreset } from '@/store/modules/view'

  const { t } = useI18n()
  const viewStore = useViewStore()

  // Props
  interface Props {
    visible: boolean
    position: { x: number; y: number }
    selectedCount: number
  }

  withDefaults(defineProps<Props>(), {
    visible: false,
    selectedCount: 1
  })

  // Emits
  const emit = defineEmits<{
    delete: []
    duplicate: []
    'change-width': [preset: WidthPreset]
    close: []
  }>()

  // Width presets
  const widthPresets: { value: WidthPreset; label: string }[] = [
    { value: '1/4', label: '1/4' },
    { value: '1/3', label: '1/3' },
    { value: '1/2', label: '1/2' },
    { value: '2/3', label: '2/3' },
    { value: '3/4', label: '3/4' },
    { value: 'full', label: '全宽' }
  ]

  // Current component
  const selectedComponent = computed(() => viewStore.selectedComponent)

  // Current width preset
  const currentWidthPreset = computed(() => {
    return selectedComponent.value?.layout?.width?.preset || '1/2'
  })

  // Actions
  function handleDelete() {
    emit('delete')
  }

  function handleDuplicate() {
    emit('duplicate')
  }

  function handleWidthChange(preset: WidthPreset) {
    emit('change-width', preset)
  }

  function handleClose() {
    emit('close')
  }
</script>

<template>
  <Teleport to="body">
    <Transition name="float-toolbar">
      <div
        v-if="visible"
        class="floating-toolbar"
        :style="{ left: `${position.x}px`, top: `${position.y}px` }"
      >
        <!-- Width Quick Select -->
        <div v-if="selectedCount === 1" class="toolbar-section width-section">
          <span class="section-label">宽度</span>
          <div class="width-buttons">
            <button
              v-for="preset in widthPresets"
              :key="preset.value"
              class="width-btn"
              :class="{ active: currentWidthPreset === preset.value }"
              @click="handleWidthChange(preset.value)"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Divider -->
        <div v-if="selectedCount === 1" class="toolbar-divider" />

        <!-- Actions -->
        <div class="toolbar-section actions-section">
          <button class="action-btn" @click="handleDuplicate" :title="t('common.copy')">
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
                d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            <span>{{ t('agent.design.view.duplicate') }}</span>
          </button>

          <button class="action-btn danger" @click="handleDelete" :title="t('common.delete')">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ t('common.delete') }}</span>
          </button>
        </div>

        <!-- Multi-select info -->
        <div v-if="selectedCount > 1" class="toolbar-section info-section">
          <span class="selection-count">已选中 {{ selectedCount }} 个组件</span>
        </div>

        <!-- Close button -->
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
  .floating-toolbar {
    position: fixed;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-lg;
    transform: translateX(-50%);
    animation: slideUp 0.15s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  // Toolbar Sections
  .toolbar-section {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  .section-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-right: $spacing-xs;
  }

  // Width Buttons
  .width-buttons {
    display: flex;
    gap: 2px;
    background: $bg-secondary;
    padding: 2px;
    border-radius: $border-radius-sm;
  }

  .width-btn {
    padding: 4px 8px;
    background: transparent;
    border: none;
    border-radius: $border-radius-xs;
    font-size: $font-size-xs;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      background: $primary-color;
      color: white;
    }
  }

  // Divider
  .toolbar-divider {
    width: 1px;
    height: 24px;
    background: $border-color-base;
    margin: 0 $spacing-xs;
  }

  // Action Buttons
  .action-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: $bg-secondary;
      border-color: $primary-light;
      color: $primary-color;
    }

    &.danger:hover {
      background: rgba($error, 0.1);
      border-color: $error;
      color: $error;
    }
  }

  // Selection Count
  .selection-count {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $primary-color;
    padding: $spacing-xs $spacing-sm;
    background: $primary-muted;
    border-radius: $border-radius-sm;
  }

  // Close Button
  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    border-radius: $border-radius-sm;
    color: $text-tertiary;
    cursor: pointer;
    transition: all $transition-fast;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: $bg-secondary;
      color: $text-primary;
    }
  }

  // Transitions
  .float-toolbar-enter-active,
  .float-toolbar-leave-active {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }

  .float-toolbar-enter-from,
  .float-toolbar-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }
</style>
