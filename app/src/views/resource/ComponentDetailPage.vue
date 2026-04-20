<template>
  <div class="component-detail-page">
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>返回列表</span>
        </button>
        <div class="breadcrumb">
          <span class="breadcrumb-item">资源管理</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item">前端组件管理</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item active">{{ component?.name }}</span>
        </div>
      </div>
    </div>

    <div v-if="component" class="page-content">
      <div class="info-card">
        <div class="info-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect
              x="14"
              y="14"
              width="7"
              height="7"
              rx="1"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>
        <div class="info-content">
          <div class="info-title">
            <span class="info-name">{{ component.name }}</span>
            <code class="info-type">{{ component.type }}</code>
          </div>
          <div class="info-meta">
            <span class="info-category">{{ categoryLabel }}</span>
            <span class="info-desc">{{ component.description }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">实时预览</h2>
        <div class="preview-container">
          <div class="preview-main">
            <div class="preview-panel">
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
            <div class="preview-code">
              <div class="code-header">
                <span class="code-title">代码</span>
                <CopyButton :text="generatedCode" />
              </div>
              <pre class="code-block"><code>{{ generatedCode }}</code></pre>
            </div>
          </div>
          <div v-if="interactiveProps.length" class="preview-controls">
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
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">使用样例</h2>
        <div v-if="component.examples?.length" class="examples-list">
          <div v-for="(example, index) in component.examples" :key="index" class="example-item">
            <div class="example-header">
              <div class="example-info">
                <h3 class="example-title">{{ example.title }}</h3>
                <p v-if="example.description" class="example-desc">{{ example.description }}</p>
              </div>
              <CopyButton :text="example.code" />
            </div>
            <div class="example-content">
              <div class="example-preview">
                <component
                  :is="componentMap[component.type]"
                  v-bind="getExampleProps(example)"
                  @click="handleEvent('click')"
                >
                  {{ component.name }}
                </component>
              </div>
              <div class="example-code">
                <pre><code>{{ example.code }}</code></pre>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无使用样例</p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">API 文档</h2>
        <div class="api-tabs">
          <button
            v-for="tab in apiTabs"
            :key="tab.key"
            :class="['api-tab', { active: activeApiTab === tab.key }]"
            @click="activeApiTab = tab.key"
          >
            {{ tab.label }}
            <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <div class="api-content">
          <div v-if="activeApiTab === 'props'" class="api-table">
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

          <div v-if="activeApiTab === 'events'" class="api-table">
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

          <div v-if="activeApiTab === 'slots'" class="api-table">
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
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <p>组件不存在</p>
      <button class="back-btn" @click="goBack">返回列表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, watch, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { COMPONENT_CATEGORIES } from '@smart-link/shared'
  import type { ComponentMeta, ExampleMeta } from '@smart-link/core'
  import { useComponentsStore } from '@/store/modules/components'
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
  import CopyButton from '@/components/common/CopyButton.vue'

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

  const route = useRoute()
  const router = useRouter()
  const componentsStore = useComponentsStore()

  const component = computed<ComponentMeta | null>(() => componentsStore.currentComponent)
  const activeApiTab = ref('props')
  const previewState = reactive<Record<string, any>>({})

  const categoryLabel = computed(() => {
    if (!component.value) return ''
    const cat = COMPONENT_CATEGORIES.find((c) => c.value === component.value?.category)
    return cat?.label || component.value.category
  })

  const interactiveProps = computed(() => {
    if (!component.value) return []
    return component.value.props.filter(
      (p) => p.options || p.type === 'boolean' || p.name === 'placeholder'
    )
  })

  const generatedCode = computed(() => {
    if (!component.value) return ''
    const componentName = component.value.type
    const props: string[] = []

    Object.entries(previewState).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'boolean') {
          if (value) props.push(key)
        } else if (typeof value === 'string') {
          props.push(`${key}="${value}"`)
        } else {
          props.push(`:${key}="${JSON.stringify(value)}"`)
        }
      }
    })

    const propsStr = props.length ? ' ' + props.join(' ') : ''
    return `<${componentName}${propsStr}>
  ${component.value.name}
</${componentName}>`
  })

  const apiTabs = computed(() => {
    if (!component.value) return []
    return [
      { key: 'props', label: 'Props', count: component.value.props.length },
      { key: 'events', label: 'Events', count: component.value.events.length },
      { key: 'slots', label: 'Slots', count: component.value.slots.length }
    ]
  })

  const loadComponent = () => {
    const type = route.params.type as string
    const found = componentsStore.loadComponentDetail(type)

    if (found) {
      initPreviewState()
    } else {
      // 组件未找到，返回列表页
      router.push('/app/resource/components')
    }
  }

  const initPreviewState = () => {
    if (!component.value) return
    Object.keys(previewState).forEach((key) => delete previewState[key])
    component.value.props.forEach((prop) => {
      if (prop.default !== undefined) {
        previewState[prop.name] = prop.default
      }
    })
  }

  const getExampleProps = (_example: ExampleMeta): Record<string, any> => {
    const result: Record<string, any> = {}
    if (component.value) {
      component.value.props.forEach((prop) => {
        if (prop.default !== undefined) {
          result[prop.name] = prop.default
        }
      })
    }
    return result
  }

  const handleEvent = (eventName: string) => {
    console.log(`Event: ${eventName}`)
  }

  const goBack = () => {
    router.push('/app/resource/components')
  }

  watch(
    () => route.params.type,
    () => {
      loadComponent()
    }
  )

  onMounted(() => {
    loadComponent()
  })
</script>

<style scoped lang="scss">
  .component-detail-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: $bg-primary;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-xl;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-light;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: $font-size-sm;
  }

  .breadcrumb-item {
    color: $text-tertiary;

    &.active {
      color: $text-primary;
      font-weight: $font-weight-medium;
    }
  }

  .breadcrumb-separator {
    color: $text-disabled;
  }

  .page-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-xl;
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }

  .info-card {
    display: flex;
    gap: $spacing-lg;
    padding: $spacing-xl;
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
  }

  .info-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(24, 144, 255, 0.1);
    border-radius: $border-radius-md;
    color: $primary-color;

    svg {
      width: 32px;
      height: 32px;
    }
  }

  .info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: $spacing-sm;
  }

  .info-title {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .info-name {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .info-type {
    font-family: 'Fira Code', monospace;
    font-size: $font-size-sm;
    color: $primary-color;
    background: rgba(24, 144, 255, 0.1);
    padding: 4px 8px;
    border-radius: $border-radius-sm;
  }

  .info-meta {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .info-category {
    font-size: $font-size-sm;
    color: $primary-color;
    background: rgba(24, 144, 255, 0.1);
    padding: 2px 8px;
    border-radius: $border-radius-sm;
  }

  .info-desc {
    font-size: $font-size-base;
    color: $text-secondary;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .section-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    padding-bottom: $spacing-sm;
    border-bottom: 2px solid $primary-color;
    display: inline-block;
  }

  .preview-container {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    overflow: hidden;
  }

  .preview-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid $border-color-light;
  }

  .preview-panel {
    padding: $spacing-xl;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-tertiary;
    border-right: 1px solid $border-color-light;
    min-height: 200px;
  }

  .preview-demo {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-code {
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
  }

  .code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-sm $spacing-md;
    background: #2d2d2d;
    border-bottom: 1px solid #3d3d3d;
  }

  .code-title {
    font-size: $font-size-sm;
    color: #909399;
  }

  .code-block {
    flex: 1;
    margin: 0;
    padding: $spacing-md;
    overflow: auto;
    font-family: 'Fira Code', monospace;
    font-size: $font-size-sm;
    line-height: 1.6;
    color: #d4d4d4;
  }

  .preview-controls {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-md;
    padding: $spacing-lg;
  }

  .control-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .control-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: $font-weight-medium;
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

  .examples-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  .example-item {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    overflow: hidden;
  }

  .example-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg;
    background: $bg-tertiary;
    border-bottom: 1px solid $border-color-light;
  }

  .example-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .example-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .example-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin: 0;
  }

  .example-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .example-preview {
    padding: $spacing-xl;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-tertiary;
    border-right: 1px solid $border-color-light;
    min-height: 120px;
  }

  .example-code {
    background: #1e1e1e;
    padding: $spacing-md;
    overflow: auto;

    pre {
      margin: 0;
      font-family: 'Fira Code', monospace;
      font-size: $font-size-sm;
      line-height: 1.6;
      color: #d4d4d4;
    }
  }

  .api-tabs {
    display: flex;
    gap: 2px;
    border-bottom: 1px solid $border-color-light;
    padding-bottom: 2px;
  }

  .api-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: $spacing-sm $spacing-lg;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast ease;
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

  .api-content {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    overflow: hidden;
  }

  .api-table {
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
      background: $bg-tertiary;
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

  .empty-state {
    text-align: center;
    padding: $spacing-3xl;
    color: $text-tertiary;
    font-size: $font-size-base;
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
  }

  .not-found {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-lg;
    color: $text-tertiary;
    font-size: $font-size-lg;
  }
</style>
