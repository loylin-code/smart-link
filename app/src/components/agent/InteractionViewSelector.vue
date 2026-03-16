<template>
  <div class="view-selector">
    <!-- Empty State -->
    <div v-if="views.length === 0" class="empty-state">
      <div class="empty-icon-wrapper">
        <span class="empty-icon">🎨</span>
      </div>
      <h3>{{ t('agent.design.view.emptyTitle') }}</h3>
      <p>{{ t('agent.design.view.emptyDesc') }}</p>
      <button class="add-view-btn" @click="showCreateDialog = true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        {{ t('agent.design.view.addView') }}
      </button>
    </div>

    <!-- Views List -->
    <div v-else class="views-content">
      <div class="content-header">
        <h3>{{ t('agent.design.view.created') }}</h3>
        <span class="count-badge">{{ views.length }}</span>
        <button class="add-more-btn" @click="showCreateDialog = true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          {{ t('agent.design.view.addView') }}
        </button>
      </div>

      <TransitionGroup name="view-list" tag="div" class="views-grid">
        <div v-for="view in views" :key="view.id" class="view-card" @click="editView(view)">
          <div class="card-thumbnail">
            <div class="thumbnail-placeholder" :class="`type--${view.type}`">
              <span class="type-icon">{{ getViewTypeIcon(view.type) }}</span>
            </div>
            <div v-if="getElementsCount(view) > 0" class="elements-count">
              {{ getElementsCount(view) }} {{ t('agent.design.view.componentsCount') }}
            </div>
          </div>
          <div class="card-body">
            <div class="card-header">
              <span class="view-name">{{ view.name }}</span>
              <span class="view-type-tag">{{ getViewTypeLabel(view.type) }}</span>
            </div>
            <p class="view-desc">{{ view.description || t('agent.design.view.noDescription') }}</p>
          </div>
          <div class="card-actions" @click.stop>
            <button class="action-btn edit" @click="editView(view)" :title="t('common.edit')">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </button>
            <button class="action-btn delete" @click="deleteView(view)" :title="t('common.delete')">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Create View Dialog -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateDialog" class="modal-overlay" @click.self="closeCreateDialog">
          <div class="modal-container create-dialog">
            <div class="modal-header">
              <h2>{{ t('agent.design.view.createTitle') }}</h2>
              <button class="close-btn" @click="closeCreateDialog">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label>{{ t('agent.design.view.viewName') }}</label>
                <input
                  v-model="newView.name"
                  type="text"
                  :placeholder="t('agent.design.view.viewNamePlaceholder')"
                />
              </div>

              <div class="form-group">
                <label>{{ t('agent.design.view.viewDescription') }}</label>
                <textarea
                  v-model="newView.description"
                  :placeholder="t('agent.design.view.viewDescPlaceholder')"
                  rows="3"
                />
              </div>

              <div class="form-group">
                <label>{{ t('agent.design.view.viewType') }}</label>
                <div class="type-selector">
                  <button
                    v-for="type in viewTypes"
                    :key="type.value"
                    class="type-option"
                    :class="{ active: newView.type === type.value }"
                    @click="newView.type = type.value"
                  >
                    <span class="type-icon">{{ type.icon }}</span>
                    <span class="type-label">{{ type.label }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="cancel-btn" @click="closeCreateDialog">
                {{ t('common.cancel') }}
              </button>
              <button class="confirm-btn" :disabled="!newView.name.trim()" @click="createView">
                {{ t('agent.design.view.createAndDesign') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useViewStore } from '@/store/modules/view'
  import type { InteractionView } from '@/types'

  interface Props {
    modelValue?: InteractionView[]
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: () => []
  })

  const emit = defineEmits<{
    'update:modelValue': [views: InteractionView[]]
  }>()

  const { t } = useI18n()
  const router = useRouter()
  const viewStore = useViewStore()

  // State
  const views = ref<InteractionView[]>([...props.modelValue])
  const showCreateDialog = ref(false)
  const newView = reactive({
    name: '',
    description: '',
    type: 'dashboard' as InteractionView['type']
  })

  // View types
  const viewTypes: { value: InteractionView['type']; icon: string; label: string }[] = [
    { value: 'dashboard', icon: '📊', label: t('agent.design.view.types.dashboard') },
    { value: 'chart', icon: '📈', label: t('agent.design.view.types.chart') },
    { value: 'table', icon: '📋', label: t('agent.design.view.types.table') },
    { value: 'form', icon: '📝', label: t('agent.design.view.types.form') },
    { value: 'custom', icon: '🎨', label: t('agent.design.view.types.custom') }
  ]

  // Methods
  function getViewTypeIcon(type: InteractionView['type']): string {
    const typeInfo = viewTypes.find((t) => t.value === type)
    return typeInfo?.icon || '🎨'
  }

  function getViewTypeLabel(type: InteractionView['type']): string {
    const typeInfo = viewTypes.find((t) => t.value === type)
    return typeInfo?.label || type
  }

  function closeCreateDialog() {
    showCreateDialog.value = false
    newView.name = ''
    newView.description = ''
    newView.type = 'dashboard'
  }

  function createView() {
    if (!newView.name.trim()) return

    const view: InteractionView = {
      id: `view-${Date.now()}`,
      name: newView.name.trim(),
      description: newView.description.trim(),
      type: newView.type,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    views.value.push(view)
    viewStore.setView(view) // Save to store
    emitUpdate()
    closeCreateDialog()

    // Navigate to view orchestration page
    router.push({
      path: `/app/agent/view/${view.id}`
    })
  }

  function editView(view: InteractionView) {
    router.push({
      path: `/app/agent/view/${view.id}`
    })
  }

  function deleteView(view: InteractionView) {
    const index = views.value.findIndex((v) => v.id === view.id)
    if (index > -1) {
      views.value.splice(index, 1)
      viewStore.deleteView(view.id) // Remove from store
      emitUpdate()
    }
  }

  // Get elements count from view schema
  function getElementsCount(view: InteractionView): number {
    if (view.schema && Array.isArray((view.schema as { elements?: unknown[] }).elements)) {
      return (view.schema as { elements: unknown[] }).elements.length
    }
    return 0
  }

  function emitUpdate() {
    emit('update:modelValue', [...views.value])
  }

  // Sync from store when returning from orchestration page
  function syncFromStore() {
    const storeViews = viewStore.getViewsAsArray()
    if (storeViews.length > 0) {
      // Replace local views with store data
      views.value = storeViews.map((v) => ({ ...v }))
      emitUpdate()
    }
  }

  // Watch props
  watch(
    () => props.modelValue,
    (newValue) => {
      views.value = [...newValue]
      // Also update store
      if (newValue.length > 0) {
        viewStore.setViews(newValue)
      }
    },
    { deep: true }
  )

  // Initialize and sync from store on mount
  onMounted(() => {
    // Sync props to store
    if (props.modelValue.length > 0) {
      viewStore.setViews(props.modelValue)
    }
    // Sync from store (in case returning from orchestration)
    syncFromStore()
  })
</script>

<style scoped lang="scss">
  .view-selector {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  // Empty State
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl;
    text-align: center;

    .empty-icon-wrapper {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
      border-radius: 50%;
      margin-bottom: $spacing-lg;
    }

    .empty-icon {
      font-size: 40px;
      opacity: 0.8;
    }

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-sm 0;
    }

    p {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin: 0 0 $spacing-xl 0;
      max-width: 320px;
    }
  }

  .add-view-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-xl;
    background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
    border: none;
    border-radius: $border-radius-lg;
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(168, 85, 247, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  // Views Content
  .views-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .content-header {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md 0;
    border-bottom: 1px solid $border-color-lighter;

    h3 {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }
  }

  .count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: #a855f7;
    color: #fff;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    border-radius: 10px;
  }

  .add-more-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-left: auto;
    padding: $spacing-xs $spacing-md;
    background: transparent;
    border: 1px solid #a855f7;
    border-radius: $border-radius-md;
    color: #a855f7;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: rgba(168, 85, 247, 0.1);
    }
  }

  .views-grid {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: $spacing-md;
    padding-top: $spacing-lg;
    align-content: start;
  }

  .view-card {
    display: flex;
    flex-direction: column;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #a855f7;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);

      .card-actions {
        opacity: 1;
      }
    }
  }

  .card-thumbnail {
    height: 120px;
    background: $bg-secondary;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .elements-count {
    position: absolute;
    bottom: $spacing-sm;
    right: $spacing-sm;
    padding: 2px 8px;
    background: rgba(168, 85, 247, 0.9);
    color: #fff;
    font-size: $font-size-xs;
    border-radius: $border-radius-full;
  }

  .thumbnail-placeholder {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-lg;

    &.type--dashboard {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
    }

    &.type--chart {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
    }

    &.type--table {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%);
    }

    &.type--form {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
    }

    &.type--custom {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
    }

    .type-icon {
      font-size: 28px;
    }
  }

  .card-body {
    padding: $spacing-md;
    flex: 1;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-sm;
    margin-bottom: $spacing-xs;
  }

  .view-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .view-type-tag {
    font-size: $font-size-xs;
    padding: 2px 8px;
    background: rgba(168, 85, 247, 0.1);
    color: #a855f7;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .view-desc {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-actions {
    display: flex;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    border-top: 1px solid $border-color-lighter;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: $spacing-xs;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.delete:hover {
      border-color: $error;
      color: $error;
      background: rgba(220, 38, 38, 0.05);
    }
  }

  // Modal
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: $spacing-xl;
  }

  .modal-container {
    width: 100%;
    max-width: 500px;
    background: $bg-primary;
    border-radius: $border-radius-xl;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $spacing-xl;
    border-bottom: 1px solid $border-color-lighter;

    h2 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }
  }

  .close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-secondary;
    border: none;
    border-radius: $border-radius-md;
    color: $text-tertiary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }
  }

  .modal-body {
    padding: $spacing-xl;
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    label {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-primary;
    }

    input,
    textarea {
      padding: $spacing-sm $spacing-md;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-md;
      font-size: $font-size-sm;
      color: $text-primary;
      outline: none;
      transition: all 0.2s ease;

      &::placeholder {
        color: $text-tertiary;
      }

      &:focus {
        border-color: #a855f7;
        box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1);
      }
    }

    textarea {
      resize: none;
    }
  }

  .type-selector {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-sm;
  }

  .type-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-md;
    background: $bg-secondary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #a855f7;
    }

    &.active {
      border-color: #a855f7;
      background: rgba(168, 85, 247, 0.05);
    }

    .type-icon {
      font-size: 24px;
    }

    .type-label {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
    padding: $spacing-md $spacing-xl;
    border-top: 1px solid $border-color-lighter;
    background: $bg-secondary;
  }

  .cancel-btn {
    padding: $spacing-sm $spacing-lg;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: $text-tertiary;
      color: $text-primary;
    }
  }

  .confirm-btn {
    padding: $spacing-sm $spacing-lg;
    background: #a855f7;
    border: none;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background: #9333ea;
    }
  }

  // Transitions
  .view-list-enter-active,
  .view-list-leave-active {
    transition: all 0.2s ease;
  }

  .view-list-enter-from,
  .view-list-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.25s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;

    .modal-container {
      transform: scale(0.95) translateY(20px);
    }
  }

  .modal-enter-active .modal-container,
  .modal-leave-active .modal-container {
    transition: all 0.25s ease;
  }
</style>
