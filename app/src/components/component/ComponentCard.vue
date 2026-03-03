<template>
  <div class="component-card" @click="$emit('click')">
    <div class="preview-area">
      <component :is="componentMap[component.type]" v-bind="previewProps">
        {{ component.name }}
      </component>
    </div>
    <div class="card-info">
      <span class="card-name">{{ component.name }}</span>
      <span class="card-category">{{ categoryLabel }}</span>
    </div>
    <div class="card-desc">{{ component.description }}</div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { ComponentMeta } from '@smart-link/shared'
  import { COMPONENT_CATEGORIES } from '@smart-link/shared'
  import {
    SlButton,
    SlInput,
    SlIcon,
    SlTag,
    SlBadge,
    SlAvatar,
    SlDivider,
    SlLink,
    SlImage,
    SlSelect,
    SlCheckbox,
    SlRadio,
    SlSwitch,
    SlContainer,
    SlRow,
    SlCol,
    SlCard,
    SlSpace,
    SlDrawer,
    SlModal,
    SlTooltip
  } from '@smart-link/ui'

  const componentMap: Record<string, any> = {
    SlButton,
    SlInput,
    SlIcon,
    SlTag,
    SlBadge,
    SlAvatar,
    SlDivider,
    SlLink,
    SlImage,
    SlSelect,
    SlCheckbox,
    SlRadio,
    SlSwitch,
    SlContainer,
    SlRow,
    SlCol,
    SlCard,
    SlSpace,
    SlDrawer,
    SlModal,
    SlTooltip
  }

  const props = defineProps<{
    component: ComponentMeta
  }>()

  defineEmits<{
    click: []
  }>()

  const categoryLabel = computed(() => {
    const cat = COMPONENT_CATEGORIES.find((c) => c.value === props.component.category)
    return cat?.label || props.component.category
  })

  const previewProps = computed(() => {
    const result: Record<string, any> = {}
    switch (props.component.type) {
      case 'SlButton':
        result.type = 'primary'
        result.size = 'medium'
        break
      case 'SlInput':
        result.placeholder = '请输入...'
        result.style = 'width: 100%'
        break
      case 'SlTag':
        result.type = 'primary'
        break
      case 'SlBadge':
        result.value = 5
        break
      case 'SlAvatar':
        result.text = 'SL'
        break
      case 'SlLink':
        result.type = 'primary'
        break
      case 'SlSelect':
        result.placeholder = '请选择'
        result.options = [
          { label: '选项一', value: '1' },
          { label: '选项二', value: '2' }
        ]
        break
      case 'SlCard':
        result.shadow = true
        break
    }
    return result
  })
</script>

<style scoped lang="scss">
  .component-card {
    background: $bg-secondary;
    border: 1px solid $bg-elevated;
    border-radius: $border-radius-lg;
    cursor: pointer;
    transition: all $transition-base ease;
    overflow: hidden;

    &:hover {
      border-color: rgba(0, 212, 255, 0.5);
      transform: translateY(-4px);
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(0, 212, 255, 0.15);

      .preview-area {
        background: $bg-tertiary;
      }
    }
  }

  .preview-area {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-tertiary;
    padding: $spacing-md;
    transition: background $transition-base ease;
  }

  .card-info {
    padding: $spacing-md $spacing-lg;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid $bg-elevated;
  }

  .card-name {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .card-category {
    font-size: $font-size-xs;
    color: $primary-color;
    background: rgba(0, 212, 255, 0.1);
    padding: 2px 8px;
    border-radius: $border-radius-sm;
  }

  .card-desc {
    padding: $spacing-sm $spacing-lg $spacing-md;
    font-size: $font-size-sm;
    color: $text-tertiary;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
