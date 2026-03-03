<template>
  <div class="component-detail">
    <div class="preview-section">
      <h3 class="section-title">实时预览</h3>
      <div class="preview-controls">
        <div v-for="prop in interactiveProps" :key="prop.name" class="control-item">
          <label class="control-label">{{ prop.name }}</label>
          <div v-if="prop.options" class="control-options">
            <button
              v-for="opt in prop.options"
              :key="opt"
              :class="['option-btn', { active: previewState[prop.name] === opt }]"
              @click="previewState[prop.name] = opt"
            >
              {{ opt }}
            </button>
          </div>
          <label v-else-if="prop.type === 'boolean'" class="control-checkbox">
            <input type="checkbox" v-model="previewState[prop.name]" />
            <span>{{ previewState[prop.name] ? '是' : '否' }}</span>
          </label>
          <input
            v-else-if="prop.type === 'string' || prop.type === 'string | number'"
            v-model="previewState[prop.name]"
            class="control-input"
            :placeholder="`输入${prop.name}`"
          />
        </div>
      </div>
      <div class="preview-demo">
        <component
          :is="componentMap[component.type]"
          v-bind="previewState"
          @click="handleEvent('click')"
        >
          {{ component.name }}
        </component>
      </div>
    </div>

    <div class="info-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <div class="info-content">
      <div v-if="activeTab === 'props'" class="info-table">
        <table>
          <thead>
            <tr>
              <th>属性名</th>
              <th>类型</th>
              <th>默认值</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prop in component.props" :key="prop.name">
              <td>
                <code class="prop-name">{{ prop.name }}</code>
              </td>
              <td>
                <span class="prop-type">{{ prop.type }}</span>
              </td>
              <td>
                <code v-if="prop.default !== undefined" class="prop-default">{{
                  prop.default
                }}</code>
                <span v-else class="prop-empty">-</span>
              </td>
              <td>{{ prop.description }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!component.props.length" class="empty-tip">暂无属性</div>
      </div>

      <div v-if="activeTab === 'events'" class="info-table">
        <table>
          <thead>
            <tr>
              <th>事件名</th>
              <th>参数</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in component.events" :key="event.name">
              <td>
                <code class="prop-name">{{ event.name }}</code>
              </td>
              <td>
                <code class="prop-type">{{ event.params }}</code>
              </td>
              <td>{{ event.description }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!component.events.length" class="empty-tip">暂无事件</div>
      </div>

      <div v-if="activeTab === 'slots'" class="info-table">
        <table>
          <thead>
            <tr>
              <th>插槽名</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in component.slots" :key="slot.name">
              <td>
                <code class="prop-name">{{ slot.name }}</code>
              </td>
              <td>{{ slot.description }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!component.slots.length" class="empty-tip">暂无插槽</div>
      </div>

      <div v-if="activeTab === 'info'" class="info-basic">
        <div class="info-item">
          <span class="info-label">组件名</span>
          <span class="info-value">{{ component.type }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">中文名</span>
          <span class="info-value">{{ component.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">分类</span>
          <span class="info-value">{{ categoryLabel }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">描述</span>
          <span class="info-value">{{ component.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, watch } from 'vue'
  import type { ComponentMeta, PropMeta } from '@smart-link/shared'
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

  const activeTab = ref('props')

  const tabs = computed(() => [
    { key: 'props', label: 'Props', count: props.component.props.length },
    { key: 'events', label: 'Events', count: props.component.events.length },
    { key: 'slots', label: 'Slots', count: props.component.slots.length },
    { key: 'info', label: '基础信息' }
  ])

  const categoryLabel = computed(() => {
    const cat = COMPONENT_CATEGORIES.find((c) => c.value === props.component.category)
    return cat?.label || props.component.category
  })

  const interactiveProps = computed(() => {
    return props.component.props.filter(
      (p) => p.options || p.type === 'boolean' || p.name === 'placeholder'
    )
  })

  const previewState = reactive<Record<string, any>>({})

  const initPreviewState = () => {
    props.component.props.forEach((prop) => {
      if (prop.default !== undefined) {
        previewState[prop.name] = prop.default
      }
    })
  }

  watch(
    () => props.component,
    () => {
      initPreviewState()
    },
    { immediate: true }
  )

  const handleEvent = (eventName: string) => {
    console.log(`Event: ${eventName}`)
  }
</script>

<style scoped lang="scss">
  .component-detail {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .section-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }

  .preview-section {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    margin-bottom: $spacing-lg;
  }

  .preview-controls {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  .control-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .control-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .control-options {
    display: flex;
    gap: 4px;
  }

  .option-btn {
    padding: 4px 12px;
    font-size: $font-size-xs;
    background: $bg-tertiary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast ease;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.active {
      background: rgba(24, 144, 255, 0.1);
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .control-checkbox {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;

    input {
      accent-color: $primary-color;
    }
  }

  .control-input {
    padding: 4px 8px;
    font-size: $font-size-sm;
    background: $bg-tertiary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-primary;
    outline: none;
    width: 120px;

    &:focus {
      border-color: $primary-color;
    }
  }

  .preview-demo {
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-tertiary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    padding: $spacing-lg;
  }

  .info-tabs {
    display: flex;
    gap: 2px;
    margin-bottom: $spacing-md;
    border-bottom: 1px solid $border-color-light;
    padding-bottom: 2px;
  }

  .tab-btn {
    padding: $spacing-sm $spacing-lg;
    font-size: $font-size-sm;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast ease;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: -3px;

    &:hover {
      color: $text-primary;
    }

    &.active {
      color: $primary-color;
      border-bottom-color: $primary-color;
    }
  }

  .tab-count {
    font-size: $font-size-xs;
    background: $bg-tertiary;
    border: 1px solid $border-color-light;
    padding: 0 6px;
    border-radius: $border-radius-full;
    color: $text-tertiary;
  }

  .info-content {
    flex: 1;
    overflow-y: auto;
  }

  .info-table {
    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      text-align: left;
      padding: $spacing-sm $spacing-md;
      border-bottom: 1px solid $border-color-light;
    }

    th {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-tertiary;
      background: $bg-secondary;
    }

    td {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }

  .prop-name {
    font-family: 'Fira Code', monospace;
    font-size: $font-size-xs;
    color: $primary-color;
    background: rgba(24, 144, 255, 0.1);
    padding: 2px 6px;
    border-radius: 3px;
  }

  .prop-type {
    font-family: 'Fira Code', monospace;
    font-size: $font-size-xs;
    color: $warning;
  }

  .prop-default {
    font-family: 'Fira Code', monospace;
    font-size: $font-size-xs;
    color: $success;
  }

  .prop-empty {
    color: $text-tertiary;
  }

  .empty-tip {
    text-align: center;
    padding: $spacing-xl;
    color: $text-tertiary;
    font-size: $font-size-sm;
  }

  .info-basic {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .info-item {
    display: flex;
    gap: $spacing-lg;
  }

  .info-label {
    width: 80px;
    flex-shrink: 0;
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .info-value {
    font-size: $font-size-sm;
    color: $text-primary;
  }
</style>
