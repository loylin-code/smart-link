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

      <!-- 属性列表 -->
      <div class="props-section">
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
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useOrchestratorStore } from '@/store/modules/orchestrator'
  import { COMPONENT_META_LIST, type ComponentMeta, type PropMeta } from '@smart-link/shared'

  const { t } = useI18n()
  const store = useOrchestratorStore()

  // 计算属性
  const selectedNode = computed(() => store.selectedNode)
  const node = computed(() => store.selectedNode)

  const componentMeta = computed<ComponentMeta | undefined>(() => {
    return store.selectedComponentMeta
  })

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
</style>
