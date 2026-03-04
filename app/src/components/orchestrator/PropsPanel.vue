<template>
  <div class="props-panel">
    <!-- 无选中提示 -->
    <div v-if="!selectedNode" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <p>{{ t('orchestrator.selectComponent') }}</p>
    </div>

    <!-- 属性编辑 -->
    <template v-else>
      <!-- 组件头部 -->
      <div class="component-header">
        <div class="component-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>
        <div class="component-info">
          <div class="component-name">{{ componentMeta?.name }}</div>
          <div class="component-type">{{ node?.type }}</div>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="panel-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-btn"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 属性标签页 -->
      <div v-show="activeTab === 'props'" class="props-section">
        <div class="section-title">{{ t('orchestrator.props') }}</div>

        <div class="props-list">
          <div v-for="prop in componentMeta?.props" :key="prop.name" class="prop-item">
            <div class="prop-label">
              <span class="prop-name">{{ prop.name }}</span>
              <span v-if="prop.required" class="prop-required">*</span>
            </div>

            <div class="prop-value">
              <!-- 字符串输入 -->
              <input
                v-if="prop.type === 'string' && !prop.options"
                type="text"
                :value="getPropValue(prop.name)"
                :placeholder="prop.description"
                @input="updateProp(prop.name, ($event.target as HTMLInputElement).value)"
                class="prop-input"
              />

              <!-- 数字输入 -->
              <input
                v-else-if="prop.type === 'number'"
                type="number"
                :value="getPropValue(prop.name)"
                @input="updateProp(prop.name, Number(($event.target as HTMLInputElement).value))"
                class="prop-input"
              />

              <!-- 布尔开关 -->
              <label v-else-if="prop.type === 'boolean'" class="prop-switch">
                <input
                  type="checkbox"
                  :checked="getPropValue(prop.name)"
                  @change="updateProp(prop.name, ($event.target as HTMLInputElement).checked)"
                />
                <span class="switch-slider"></span>
              </label>

              <!-- 下拉选择 -->
              <select
                v-else-if="prop.options"
                :value="getPropValue(prop.name)"
                @change="updateProp(prop.name, ($event.target as HTMLSelectElement).value)"
                class="prop-select"
              >
                <option v-for="opt in prop.options" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>

              <!-- 其他类型 -->
              <input
                v-else
                type="text"
                :value="getPropValue(prop.name)"
                @input="updateProp(prop.name, ($event.target as HTMLInputElement).value)"
                class="prop-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 样式标签页 -->
      <div v-show="activeTab === 'style'" class="props-section">
        <div class="section-title">样式设置</div>

        <div class="props-list">
          <!-- 常用样式 -->
          <div class="style-group">
            <div class="group-title">布局</div>
            <div class="style-row">
              <div class="style-item">
                <label>宽度</label>
                <input
                  type="text"
                  :value="getStyleValue('width')"
                  @input="updateStyle('width', ($event.target as HTMLInputElement).value)"
                  placeholder="auto"
                  class="prop-input"
                />
              </div>
              <div class="style-item">
                <label>高度</label>
                <input
                  type="text"
                  :value="getStyleValue('height')"
                  @input="updateStyle('height', ($event.target as HTMLInputElement).value)"
                  placeholder="auto"
                  class="prop-input"
                />
              </div>
            </div>
            <div class="style-row">
              <div class="style-item">
                <label>内边距</label>
                <input
                  type="text"
                  :value="getStyleValue('padding')"
                  @input="updateStyle('padding', ($event.target as HTMLInputElement).value)"
                  placeholder="0"
                  class="prop-input"
                />
              </div>
              <div class="style-item">
                <label>外边距</label>
                <input
                  type="text"
                  :value="getStyleValue('margin')"
                  @input="updateStyle('margin', ($event.target as HTMLInputElement).value)"
                  placeholder="0"
                  class="prop-input"
                />
              </div>
            </div>
          </div>

          <div class="style-group">
            <div class="group-title">外观</div>
            <div class="style-row">
              <div class="style-item">
                <label>背景色</label>
                <input
                  type="color"
                  :value="getStyleValue('backgroundColor') || '#ffffff'"
                  @input="updateStyle('backgroundColor', ($event.target as HTMLInputElement).value)"
                  class="color-input"
                />
              </div>
              <div class="style-item">
                <label>文字色</label>
                <input
                  type="color"
                  :value="getStyleValue('color') || '#000000'"
                  @input="updateStyle('color', ($event.target as HTMLInputElement).value)"
                  class="color-input"
                />
              </div>
            </div>
            <div class="style-row">
              <div class="style-item full-width">
                <label>边框</label>
                <input
                  type="text"
                  :value="getStyleValue('border')"
                  @input="updateStyle('border', ($event.target as HTMLInputElement).value)"
                  placeholder="none"
                  class="prop-input"
                />
              </div>
            </div>
            <div class="style-row">
              <div class="style-item">
                <label>圆角</label>
                <input
                  type="text"
                  :value="getStyleValue('borderRadius')"
                  @input="updateStyle('borderRadius', ($event.target as HTMLInputElement).value)"
                  placeholder="0"
                  class="prop-input"
                />
              </div>
              <div class="style-item">
                <label>阴影</label>
                <input
                  type="text"
                  :value="getStyleValue('boxShadow')"
                  @input="updateStyle('boxShadow', ($event.target as HTMLInputElement).value)"
                  placeholder="none"
                  class="prop-input"
                />
              </div>
            </div>
          </div>

          <div class="style-group">
            <div class="group-title">文字</div>
            <div class="style-row">
              <div class="style-item">
                <label>字号</label>
                <input
                  type="text"
                  :value="getStyleValue('fontSize')"
                  @input="updateStyle('fontSize', ($event.target as HTMLInputElement).value)"
                  placeholder="14px"
                  class="prop-input"
                />
              </div>
              <div class="style-item">
                <label>字重</label>
                <select
                  :value="getStyleValue('fontWeight')"
                  @change="updateStyle('fontWeight', ($event.target as HTMLSelectElement).value)"
                  class="prop-select"
                >
                  <option value="">默认</option>
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">700</option>
                  <option value="800">800</option>
                  <option value="900">900</option>
                </select>
              </div>
            </div>
            <div class="style-row">
              <div class="style-item full-width">
                <label>对齐</label>
                <div class="align-btns">
                  <button
                    :class="{ active: getStyleValue('textAlign') === 'left' }"
                    @click="updateStyle('textAlign', 'left')"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 6h18M3 12h12M3 18h18"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                  <button
                    :class="{ active: getStyleValue('textAlign') === 'center' }"
                    @click="updateStyle('textAlign', 'center')"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 6h18M6 12h12M3 18h18"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                  <button
                    :class="{ active: getStyleValue('textAlign') === 'right' }"
                    @click="updateStyle('textAlign', 'right')"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 6h18M9 12h12M3 18h18"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 事件标签页 -->
      <div v-show="activeTab === 'events'" class="props-section">
        <div class="section-title">事件绑定</div>

        <div class="props-list">
          <div v-for="event in componentMeta?.events" :key="event.name" class="event-item">
            <div class="event-header">
              <span class="event-name">{{ event.name }}</span>
              <span class="event-desc">{{ event.description }}</span>
            </div>
            <div class="event-config">
              <select
                v-model="eventConfigs[event.name].type"
                class="prop-select"
                @change="onEventTypeChange(event.name)"
              >
                <option value="">无</option>
                <option value="builtin">内置动作</option>
                <option value="custom">自定义代码</option>
              </select>

              <!-- 内置动作配置 -->
              <template v-if="eventConfigs[event.name]?.type === 'builtin'">
                <select v-model="eventConfigs[event.name].action" class="prop-select">
                  <option value="">选择动作</option>
                  <option value="navigate">页面跳转</option>
                  <option value="showMessage">显示消息</option>
                  <option value="submitForm">提交表单</option>
                  <option value="resetForm">重置表单</option>
                  <option value="openModal">打开弹窗</option>
                  <option value="closeModal">关闭弹窗</option>
                </select>
                <input
                  v-if="eventConfigs[event.name]?.action === 'navigate'"
                  v-model="eventConfigs[event.name].params"
                  type="text"
                  placeholder="跳转路径"
                  class="prop-input"
                />
                <input
                  v-if="eventConfigs[event.name]?.action === 'showMessage'"
                  v-model="eventConfigs[event.name].params"
                  type="text"
                  placeholder="消息内容"
                  class="prop-input"
                />
              </template>

              <!-- 自定义代码配置 -->
              <textarea
                v-if="eventConfigs[event.name]?.type === 'custom'"
                v-model="eventConfigs[event.name].code"
                class="prop-textarea"
                placeholder="输入JavaScript代码..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <div v-if="!componentMeta?.events?.length" class="empty-events">该组件没有可用事件</div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <button class="action-btn" @click="handleCopy">
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
          <span>{{ t('orchestrator.copy') }}</span>
        </button>
        <button class="action-btn action-btn--danger" @click="handleDelete">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t('orchestrator.delete') }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useOrchestratorStore } from '@/store/modules/orchestrator'
  import { COMPONENT_META_LIST, type ComponentMeta, type PropMeta } from '@smart-link/shared'
  import type { EventBinding, EventHandler } from '@smart-link/core'

  const { t } = useI18n()
  const store = useOrchestratorStore()

  // 标签页
  const tabs = [
    { value: 'props', label: '属性' },
    { value: 'style', label: '样式' },
    { value: 'events', label: '事件' }
  ]
  const activeTab = ref('props')

  // 事件配置
  const eventConfigs = ref<
    Record<string, { type: string; action: string; params: string; code: string }>
  >({})

  // 计算属性
  const selectedNode = computed(() => store.selectedNode)
  const node = computed(() => store.selectedNode)

  const componentMeta = computed<ComponentMeta | undefined>(() => {
    return store.selectedComponentMeta
  })

  // 监听节点变化，初始化事件配置
  watch(
    node,
    (newNode) => {
      if (newNode?.events) {
        const configs: Record<string, any> = {}
        for (const event of newNode.events) {
          configs[event.event] = {
            type: event.handler.type || '',
            action: event.handler.action || '',
            params: '',
            code: event.handler.code || ''
          }
        }
        eventConfigs.value = configs
      } else {
        eventConfigs.value = {}
      }
    },
    { immediate: true }
  )

  // 获取属性值
  function getPropValue(propName: string): any {
    if (!node.value?.props?.static) return undefined
    return node.value.props.static[propName]
  }

  // 更新属性
  function updateProp(propName: string, value: any) {
    if (!node.value) return
    store.updateStaticProp(node.value.id, propName, value)
  }

  // 获取样式值
  function getStyleValue(propName: string): any {
    if (!node.value?.style?.static) return ''
    return node.value.style.static[propName] || ''
  }

  // 更新样式
  function updateStyle(propName: string, value: any) {
    if (!node.value) return

    const currentStyle = node.value.style?.static || {}
    const newStyle = { ...currentStyle }

    if (value === '' || value === undefined) {
      delete newStyle[propName]
    } else {
      newStyle[propName] = value
    }

    store.updateComponentStyle(node.value.id, { static: newStyle })
  }

  // 事件类型变化
  function onEventTypeChange(eventName: string) {
    const config = eventConfigs.value[eventName]
    if (config) {
      config.action = ''
      config.params = ''
      config.code = ''
    }
  }

  // 更新事件
  function updateEvent(eventName: string) {
    if (!node.value) return

    const config = eventConfigs.value[eventName]
    if (!config || !config.type) {
      // 移除事件
      const events = node.value.events?.filter((e) => e.event !== eventName) || []
      // 直接更新节点的events属性
      node.value.events = events.length > 0 ? events : undefined
      return
    }

    const handler: EventHandler = {
      type: config.type as any
    }

    if (config.type === 'builtin' && config.action) {
      handler.action = config.action as any
      if (config.params) {
        handler.params = { value: config.params }
      }
    } else if (config.type === 'custom' && config.code) {
      handler.code = config.code
    }

    const events = node.value.events || []
    const existingIndex = events.findIndex((e) => e.event === eventName)

    if (existingIndex >= 0) {
      events[existingIndex] = { event: eventName, handler }
    } else {
      events.push({ event: eventName, handler })
    }

    // 直接更新节点的events属性
    node.value.events = events
    // 触发历史记录
    store.updateStaticProp(node.value.id, '__event_update__', Date.now())
  }

  // 复制
  function handleCopy() {
    store.copyComponent()
  }

  // 删除
  function handleDelete() {
    store.deleteSelectedComponents()
  }
</script>

<style scoped lang="scss">
  .props-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: transparent;
    color: rgba(255, 255, 255, 0.85);
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.25);
    font-size: 13px;

    svg {
      width: 48px;
      height: 48px;
      opacity: 0.3;
    }
  }

  .component-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .component-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 212, 255, 0.1);
    border-radius: 8px;
    color: #00d4ff;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .component-info {
    flex: 1;
  }

  .component-name {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
  }

  .component-type {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
    font-family: monospace;
    margin-top: 2px;
  }

  .props-section {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.45);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }

  .props-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .prop-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .prop-label {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .prop-name {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.65);
  }

  .prop-required {
    color: #ef4444;
    font-size: 12px;
  }

  .prop-value {
    width: 100%;
  }

  .prop-input {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #00d4ff;
      background: rgba(0, 212, 255, 0.05);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.35);
    }
  }

  .prop-select {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #00d4ff;
    }
  }

  .prop-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;

    input {
      opacity: 0;
      width: 0;
      height: 0;

      &:checked + .switch-slider {
        background-color: #00d4ff;

        &:before {
          transform: translateX(20px);
        }
      }
    }

    .switch-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: rgba(255, 255, 255, 0.12);
      transition: 0.2s;
      border-radius: 12px;

      &:before {
        position: absolute;
        content: '';
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.2s;
        border-radius: 50%;
      }
    }
  }

  .actions-section {
    padding: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.65);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.85);
    }

    &--danger:hover {
      border-color: #ef4444;
      color: #ef4444;
    }
  }

  .panel-tabs {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .tab-btn {
    flex: 1;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: rgba(255, 255, 255, 0.85);
    }

    &.active {
      background: rgba(0, 212, 255, 0.15);
      border-color: rgba(0, 212, 255, 0.3);
      color: #00d4ff;
    }
  }

  .style-group {
    margin-bottom: 16px;

    .group-title {
      font-size: 11px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.35);
      margin-bottom: 8px;
    }
  }

  .style-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .style-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.45);
    }
  }

  .color-input {
    width: 100%;
    height: 32px;
    padding: 2px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
      padding: 2px;
    }

    &::-webkit-color-swatch {
      border-radius: 4px;
      border: none;
    }
  }

  .align-btns {
    display: flex;
    gap: 4px;

    button {
      flex: 1;
      padding: 6px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.45);
      cursor: pointer;
      transition: all 0.2s;

      svg {
        width: 14px;
        height: 14px;
      }

      &:hover {
        color: rgba(255, 255, 255, 0.85);
      }

      &.active {
        background: rgba(0, 212, 255, 0.15);
        border-color: rgba(0, 212, 255, 0.3);
        color: #00d4ff;
      }
    }
  }

  .event-item {
    padding: 8px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 6px;
  }

  .event-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .event-name {
    font-size: 12px;
    font-weight: 500;
    color: #00d4ff;
    font-family: monospace;
  }

  .event-desc {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
  }

  .event-config {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .prop-textarea {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 12px;
    font-family: monospace;
    resize: vertical;

    &:focus {
      outline: none;
      border-color: #00d4ff;
      background: rgba(0, 212, 255, 0.05);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.35);
    }
  }

  .empty-events {
    text-align: center;
    padding: 16px;
    color: rgba(255, 255, 255, 0.35);
    font-size: 12px;
  }
</style>
