<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  // Props
  interface Props {
    modelValue: 'desktop' | 'tablet' | 'mobile'
  }

  const props = defineProps<Props>()

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: 'desktop' | 'tablet' | 'mobile']
  }>()

  // Device options
  const devices = [
    {
      value: 'desktop' as const,
      icon: 'desktop',
      label: t('agent.design.view.desktop'),
      width: '100%'
    },
    {
      value: 'tablet' as const,
      icon: 'tablet',
      label: t('agent.design.view.tablet'),
      width: '768px'
    },
    {
      value: 'mobile' as const,
      icon: 'mobile',
      label: t('agent.design.view.mobile'),
      width: '375px'
    }
  ]

  // Current device
  const currentDevice = computed(() => props.modelValue)

  // Select device
  function selectDevice(device: 'desktop' | 'tablet' | 'mobile') {
    emit('update:modelValue', device)
  }
</script>

<template>
  <div class="device-selector">
    <button
      v-for="device in devices"
      :key="device.value"
      class="device-btn"
      :class="{ active: currentDevice === device.value }"
      :title="device.label"
      @click="selectDevice(device.value)"
    >
      <!-- Desktop Icon -->
      <svg
        v-if="device.icon === 'desktop'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>

      <!-- Tablet Icon -->
      <svg
        v-else-if="device.icon === 'tablet'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M10 18h4" />
      </svg>

      <!-- Mobile Icon -->
      <svg
        v-else-if="device.icon === 'mobile'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M10 18h4" />
      </svg>

      <span class="device-label">{{ device.label }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
  .device-selector {
    display: flex;
    gap: $spacing-xs;
    padding: $spacing-xs;
    background: $bg-secondary;
    border-radius: $border-radius-md;
  }

  .device-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background: transparent;
    border: none;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    svg {
      width: 18px;
      height: 18px;
    }

    .device-label {
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
    }

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      background: $primary-color;
      color: white;
    }
  }
</style>
