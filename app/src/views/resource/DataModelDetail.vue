<template>
  <div v-if="model" class="data-model-detail">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ t('common.back') }}
        </button>
        <div class="header-title">
          <span class="model-icon">📄</span>
          <h1>{{ model.displayName }}</h1>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="resetChanges">
          {{ t('common.reset') }}
        </button>
        <button class="btn btn-primary" @click="saveModel">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" stroke-width="2" />
          </svg>
          {{ t('common.save') }}
        </button>
      </div>
    </header>

    <!-- 基本信息 -->
    <section v-if="editableModel" class="info-section">
      <h2 class="section-title">{{ t('datamodel.basicInfo') }}</h2>
      <div class="info-grid">
        <div class="form-group">
          <label>{{ t('datamodel.modelName') }}</label>
          <input v-model="editableModel.name" type="text" />
        </div>
        <div class="form-group">
          <label>{{ t('datamodel.displayName') }}</label>
          <input v-model="editableModel.displayName" type="text" />
        </div>
        <div class="form-group">
          <label>{{ t('datamodel.modelType') }}</label>
          <select v-model="editableModel.type">
            <option v-for="type in modelTypes" :key="type.value" :value="type.value">
              {{ type.icon }} {{ type.label }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ t('datamodel.category') }}</label>
          <select v-model="editableModel.category">
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>
        <div class="form-group form-group-full">
          <label>{{ t('datamodel.description') }}</label>
          <textarea v-model="editableModel.description" rows="2"></textarea>
        </div>
      </div>
    </section>

    <!-- 字段定义 -->
    <section class="fields-section">
      <div class="section-header">
        <h2 class="section-title">{{ t('datamodel.fieldDefinitions') }}</h2>
        <button class="btn btn-small btn-primary" @click="showAddFieldDialog = true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ t('datamodel.addField') }}
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('datamodel.fieldName') }}</th>
              <th>{{ t('datamodel.fieldType') }}</th>
              <th>{{ t('datamodel.required') }}</th>
              <th>{{ t('datamodel.defaultValue') }}</th>
              <th>{{ t('datamodel.description') }}</th>
              <th>{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody v-if="editableModel">
            <tr v-for="field in editableModel.fields" :key="field.id">
              <td class="field-name">{{ field.name }}</td>
              <td>
                <span class="type-badge" :class="`type-${field.type}`">
                  {{ getFieldTypeLabel(field.type) }}
                </span>
              </td>
              <td>
                <span v-if="field.required" class="required-badge">✓</span>
                <span v-else class="optional-badge">-</span>
              </td>
              <td>{{ field.defaultValue || '-' }}</td>
              <td class="description-cell">{{ field.description }}</td>
              <td>
                <div class="action-btns">
                  <button class="action-btn" @click="editField(field)">
                    {{ t('common.edit') }}
                  </button>
                  <button class="action-btn action-btn-danger" @click="deleteField(field.id)">
                    {{ t('common.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="editableModel?.fields.length === 0" class="empty-section">
        <p>{{ t('datamodel.noFields') }}</p>
        <button class="btn btn-small btn-primary" @click="showAddFieldDialog = true">
          {{ t('datamodel.addFirstField') }}
        </button>
      </div>
    </section>

    <!-- 关联关系 -->
    <section class="relations-section">
      <div class="section-header">
        <h2 class="section-title">{{ t('datamodel.relations') }}</h2>
        <button class="btn btn-small btn-primary" @click="showAddRelationDialog = true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ t('datamodel.addRelation') }}
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('datamodel.targetModel') }}</th>
              <th>{{ t('datamodel.relationType') }}</th>
              <th>{{ t('datamodel.foreignKey') }}</th>
              <th>{{ t('datamodel.targetKey') }}</th>
              <th>{{ t('datamodel.cascade') }}</th>
              <th>{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="relation in editableModel?.relations" :key="relation.id">
              <td>{{ relation.targetModel }}</td>
              <td>
                <span class="relation-badge">{{
                  getRelationTypeLabel(relation.relationType)
                }}</span>
              </td>
              <td>{{ relation.foreignKey }}</td>
              <td>{{ relation.targetKey }}</td>
              <td>
                <div class="cascade-tags">
                  <span v-if="relation.cascadeDelete" class="cascade-tag">{{
                    t('datamodel.cascadeDelete')
                  }}</span>
                  <span v-if="relation.cascadeUpdate" class="cascade-tag">{{
                    t('datamodel.cascadeUpdate')
                  }}</span>
                  <span
                    v-if="!relation.cascadeDelete && !relation.cascadeUpdate"
                    class="cascade-none"
                    >-</span
                  >
                </div>
              </td>
              <td>
                <div class="action-btns">
                  <button class="action-btn" @click="editRelation(relation)">
                    {{ t('common.edit') }}
                  </button>
                  <button class="action-btn action-btn-danger" @click="deleteRelation(relation.id)">
                    {{ t('common.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="editableModel?.relations.length === 0" class="empty-section">
        <p>{{ t('datamodel.noRelations') }}</p>
        <button class="btn btn-small btn-primary" @click="showAddRelationDialog = true">
          {{ t('datamodel.addFirstRelation') }}
        </button>
      </div>
    </section>

    <!-- 添加/编辑字段弹窗 -->
    <div v-if="showAddFieldDialog" class="dialog-overlay" @click.self="closeFieldDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingField ? t('datamodel.editField') : t('datamodel.addFieldTitle') }}</h3>
          <button class="close-btn" @click="closeFieldDialog">✕</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>{{ t('datamodel.fieldName') }} <span class="required">*</span></label>
            <input
              v-model="fieldForm.name"
              type="text"
              :placeholder="t('datamodel.fieldNamePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label>{{ t('datamodel.displayName') }} <span class="required">*</span></label>
            <input
              v-model="fieldForm.displayName"
              type="text"
              :placeholder="t('datamodel.displayNamePlaceholder')"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>{{ t('datamodel.fieldType') }} <span class="required">*</span></label>
              <select v-model="fieldForm.type">
                <option v-for="type in fieldTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
            <div class="form-group form-group-checkbox">
              <label class="checkbox-label">
                <input v-model="fieldForm.required" type="checkbox" />
                <span>{{ t('datamodel.requiredField') }}</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('datamodel.defaultValue') }}</label>
            <input v-model="fieldForm.defaultValue" type="text" />
          </div>
          <div class="form-group">
            <label>{{ t('datamodel.description') }}</label>
            <textarea v-model="fieldForm.description" rows="2"></textarea>
          </div>

          <!-- 高级选项 -->
          <div class="advanced-section">
            <button class="advanced-toggle" @click="showAdvanced = !showAdvanced">
              {{ t('datamodel.advancedOptions') }}
              <span class="toggle-icon" :class="{ open: showAdvanced }">▼</span>
            </button>
            <div v-show="showAdvanced" class="advanced-content">
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('datamodel.minLength') }}</label>
                  <input v-model.number="fieldForm.validation.minLength" type="number" />
                </div>
                <div class="form-group">
                  <label>{{ t('datamodel.maxLength') }}</label>
                  <input v-model.number="fieldForm.validation.maxLength" type="number" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>{{ t('datamodel.min') }}</label>
                  <input v-model.number="fieldForm.validation.min" type="number" />
                </div>
                <div class="form-group">
                  <label>{{ t('datamodel.max') }}</label>
                  <input v-model.number="fieldForm.validation.max" type="number" />
                </div>
              </div>
              <div class="form-group">
                <label>{{ t('datamodel.pattern') }}</label>
                <input v-model="fieldForm.validation.pattern" type="text" />
              </div>
              <div v-if="fieldForm.type === 'enum'" class="form-group">
                <label>{{ t('datamodel.enumValues') }}</label>
                <input
                  v-model="enumValuesInput"
                  type="text"
                  :placeholder="t('datamodel.enumValuesPlaceholder')"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeFieldDialog">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn-primary" @click="saveField">
            {{ t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑关联弹窗 -->
    <div v-if="showAddRelationDialog" class="dialog-overlay" @click.self="closeRelationDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>
            {{ editingRelation ? t('datamodel.editRelation') : t('datamodel.addRelationTitle') }}
          </h3>
          <button class="close-btn" @click="closeRelationDialog">✕</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>{{ t('datamodel.targetModel') }} <span class="required">*</span></label>
            <select v-model="relationForm.targetModel">
              <option value="">{{ t('datamodel.selectModel') }}</option>
              <option v-for="m in availableTargetModels" :key="m.id" :value="m.name">
                {{ m.displayName }} ({{ m.name }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('datamodel.relationType') }} <span class="required">*</span></label>
            <div class="radio-group">
              <label
                v-for="type in relationTypes"
                :key="type.value"
                class="radio-label"
                :class="{ active: relationForm.relationType === type.value }"
              >
                <input v-model="relationForm.relationType" type="radio" :value="type.value" />
                <span class="radio-text">{{ type.label }}</span>
                <small>{{ type.description }}</small>
              </label>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>{{ t('datamodel.foreignKey') }} <span class="required">*</span></label>
              <select v-model="relationForm.foreignKey">
                <option value="">{{ t('datamodel.selectField') }}</option>
                <option v-for="field in editableModel?.fields" :key="field.id" :value="field.name">
                  {{ field.displayName }} ({{ field.name }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ t('datamodel.targetKey') }} <span class="required">*</span></label>
              <input v-model="relationForm.targetKey" type="text" />
            </div>
          </div>
          <div class="form-group form-group-checkbox-group">
            <label class="checkbox-label">
              <input v-model="relationForm.cascadeDelete" type="checkbox" />
              <span>{{ t('datamodel.cascadeDelete') }}</span>
              <small>{{ t('datamodel.cascadeDeleteDesc') }}</small>
            </label>
            <label class="checkbox-label">
              <input v-model="relationForm.cascadeUpdate" type="checkbox" />
              <span>{{ t('datamodel.cascadeUpdate') }}</span>
              <small>{{ t('datamodel.cascadeUpdateDesc') }}</small>
            </label>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeRelationDialog">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn-primary" @click="saveRelation">
            {{ t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <p>{{ t('datamodel.modelNotFound') }}</p>
    <button class="btn btn-primary" @click="goBack">{{ t('common.backToList') }}</button>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useDataModelStore } from '@/store/modules/datamodel'
  import type {
    DataModel,
    DataModelField,
    DataModelRelation,
    DataModelType,
    DataModelFieldType,
    DataModelRelationType
  } from '@/types'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const dataModelStore = useDataModelStore()

  // State
  const model = ref<DataModel | null>(null)
  const editableModel = ref<DataModel | null>(null)
  const showAddFieldDialog = ref(false)
  const showAddRelationDialog = ref(false)
  const showAdvanced = ref(false)
  const editingField = ref<DataModelField | null>(null)
  const editingRelation = ref<DataModelRelation | null>(null)
  const enumValuesInput = ref('')

  // Forms
  const fieldForm = ref({
    id: '',
    name: '',
    displayName: '',
    type: 'string' as DataModelFieldType,
    required: false,
    defaultValue: '',
    description: '',
    validation: {
      minLength: undefined as number | undefined,
      maxLength: undefined as number | undefined,
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      pattern: ''
    }
  })

  const relationForm = ref({
    id: '',
    targetModel: '',
    relationType: '1:N' as DataModelRelationType,
    foreignKey: '',
    targetKey: '',
    cascadeDelete: false,
    cascadeUpdate: false
  })

  // Constants
  const modelTypes = [
    { value: 'entity' as DataModelType, label: t('datamodel.type.entity'), icon: '📄' },
    { value: 'input' as DataModelType, label: t('datamodel.type.input'), icon: '📥' },
    { value: 'output' as DataModelType, label: t('datamodel.type.output'), icon: '📤' },
    { value: 'intermediate' as DataModelType, label: t('datamodel.type.intermediate'), icon: '🔄' }
  ]

  const fieldTypes = [
    { value: 'string' as DataModelFieldType, label: t('datamodel.fieldType.string') },
    { value: 'number' as DataModelFieldType, label: t('datamodel.fieldType.number') },
    { value: 'boolean' as DataModelFieldType, label: t('datamodel.fieldType.boolean') },
    { value: 'date' as DataModelFieldType, label: t('datamodel.fieldType.date') },
    { value: 'enum' as DataModelFieldType, label: t('datamodel.fieldType.enum') },
    { value: 'object' as DataModelFieldType, label: t('datamodel.fieldType.object') },
    { value: 'array' as DataModelFieldType, label: t('datamodel.fieldType.array') }
  ]

  const relationTypes = [
    {
      value: '1:N' as DataModelRelationType,
      label: t('datamodel.relationType.1N'),
      description: t('datamodel.relationType.1NDesc')
    },
    {
      value: 'N:1' as DataModelRelationType,
      label: t('datamodel.relationType.N1'),
      description: t('datamodel.relationType.N1Desc')
    },
    {
      value: '1:1' as DataModelRelationType,
      label: t('datamodel.relationType.11'),
      description: t('datamodel.relationType.11Desc')
    },
    {
      value: 'N:N' as DataModelRelationType,
      label: t('datamodel.relationType.NN'),
      description: t('datamodel.relationType.NNDesc')
    }
  ]

  const categories = computed(() => dataModelStore.categories)

  const availableTargetModels = computed(() => {
    return dataModelStore.models.filter((m) => m.id !== model.value?.id)
  })

  // Methods
  const loadModel = () => {
    const modelId = route.params.id as string
    const found = dataModelStore.getModelById(modelId)
    if (found) {
      model.value = found
      editableModel.value = JSON.parse(JSON.stringify(found))
    }
  }

  const goBack = () => {
    router.push('/app/resource/datamodel')
  }

  const getModelTypeLabel = (type: DataModelType): string => {
    const found = modelTypes.find((t) => t.value === type)
    return found?.label || type
  }

  const getFieldTypeLabel = (type: DataModelFieldType): string => {
    const found = fieldTypes.find((t) => t.value === type)
    return found?.label || type
  }

  const getRelationTypeLabel = (type: DataModelRelationType): string => {
    const found = relationTypes.find((t) => t.value === type)
    return found?.label || type
  }

  const resetChanges = () => {
    if (model.value) {
      editableModel.value = JSON.parse(JSON.stringify(model.value))
    }
  }

  const saveModel = () => {
    if (editableModel.value && model.value) {
      dataModelStore.updateModel(model.value.id, editableModel.value)
      // 重新加载模型以获取更新后的数据
      loadModel()
    }
  }

  // Field operations
  const closeFieldDialog = () => {
    showAddFieldDialog.value = false
    editingField.value = null
    resetFieldForm()
  }

  const resetFieldForm = () => {
    fieldForm.value = {
      id: '',
      name: '',
      displayName: '',
      type: 'string',
      required: false,
      defaultValue: '',
      description: '',
      validation: {
        minLength: undefined,
        maxLength: undefined,
        min: undefined,
        max: undefined,
        pattern: ''
      }
    }
    enumValuesInput.value = ''
    showAdvanced.value = false
  }

  const editField = (field: DataModelField) => {
    editingField.value = field
    fieldForm.value = {
      id: field.id,
      name: field.name,
      displayName: field.displayName,
      type: field.type,
      required: field.required,
      defaultValue: field.defaultValue || '',
      description: field.description,
      validation: {
        minLength: field.validation?.minLength,
        maxLength: field.validation?.maxLength,
        min: field.validation?.min,
        max: field.validation?.max,
        pattern: field.validation?.pattern || ''
      }
    }
    if (field.validation?.enumValues) {
      enumValuesInput.value = field.validation.enumValues.join(',')
    }
    showAddFieldDialog.value = true
  }

  const saveField = () => {
    if (!editableModel.value) return

    const validation: any = {}
    if (fieldForm.value.validation.minLength !== undefined) {
      validation.minLength = fieldForm.value.validation.minLength
    }
    if (fieldForm.value.validation.maxLength !== undefined) {
      validation.maxLength = fieldForm.value.validation.maxLength
    }
    if (fieldForm.value.validation.min !== undefined) {
      validation.min = fieldForm.value.validation.min
    }
    if (fieldForm.value.validation.max !== undefined) {
      validation.max = fieldForm.value.validation.max
    }
    if (fieldForm.value.validation.pattern) {
      validation.pattern = fieldForm.value.validation.pattern
    }
    if (enumValuesInput.value && fieldForm.value.type === 'enum') {
      validation.enumValues = enumValuesInput.value.split(',').map((v) => v.trim())
    }

    const fieldData: DataModelField = {
      id: editingField.value?.id || `field_${Date.now()}`,
      name: fieldForm.value.name,
      displayName: fieldForm.value.displayName,
      type: fieldForm.value.type,
      required: fieldForm.value.required,
      defaultValue: fieldForm.value.defaultValue || undefined,
      description: fieldForm.value.description,
      validation: Object.keys(validation).length > 0 ? validation : undefined
    }

    if (editingField.value) {
      const index = editableModel.value.fields.findIndex((f) => f.id === editingField.value!.id)
      if (index !== -1) {
        editableModel.value.fields[index] = fieldData
      }
    } else {
      editableModel.value.fields.push(fieldData)
    }

    closeFieldDialog()
  }

  const deleteField = (fieldId: string) => {
    if (!editableModel.value) return
    if (confirm(t('datamodel.confirmDeleteField'))) {
      editableModel.value.fields = editableModel.value.fields.filter((f) => f.id !== fieldId)
    }
  }

  // Relation operations
  const closeRelationDialog = () => {
    showAddRelationDialog.value = false
    editingRelation.value = null
    resetRelationForm()
  }

  const resetRelationForm = () => {
    relationForm.value = {
      id: '',
      targetModel: '',
      relationType: '1:N',
      foreignKey: '',
      targetKey: '',
      cascadeDelete: false,
      cascadeUpdate: false
    }
  }

  const editRelation = (relation: DataModelRelation) => {
    editingRelation.value = relation
    relationForm.value = {
      id: relation.id,
      targetModel: relation.targetModel,
      relationType: relation.relationType,
      foreignKey: relation.foreignKey,
      targetKey: relation.targetKey,
      cascadeDelete: relation.cascadeDelete,
      cascadeUpdate: relation.cascadeUpdate
    }
    showAddRelationDialog.value = true
  }

  const saveRelation = () => {
    if (!editableModel.value) return

    const relationData: DataModelRelation = {
      id: editingRelation.value?.id || `rel_${Date.now()}`,
      targetModel: relationForm.value.targetModel,
      relationType: relationForm.value.relationType,
      foreignKey: relationForm.value.foreignKey,
      targetKey: relationForm.value.targetKey,
      cascadeDelete: relationForm.value.cascadeDelete,
      cascadeUpdate: relationForm.value.cascadeUpdate
    }

    if (editingRelation.value) {
      const index = editableModel.value.relations.findIndex(
        (r) => r.id === editingRelation.value!.id
      )
      if (index !== -1) {
        editableModel.value.relations[index] = relationData
      }
    } else {
      editableModel.value.relations.push(relationData)
    }

    closeRelationDialog()
  }

  const deleteRelation = (relationId: string) => {
    if (!editableModel.value) return
    if (confirm(t('datamodel.confirmDeleteRelation'))) {
      editableModel.value.relations = editableModel.value.relations.filter(
        (r) => r.id !== relationId
      )
    }
  }

  onMounted(() => {
    loadModel()
  })
</script>

<style scoped lang="scss">
  .data-model-detail {
    height: 100%;
    padding: $spacing-xl;
    overflow-y: auto;
  }

  // 页面头部
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $border-color-light;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    .model-icon {
      font-size: 24px;
    }

    h1 {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    gap: $spacing-md;
  }

  .btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;
    border: 1px solid transparent;

    svg {
      width: 16px;
      height: 16px;
    }

    &.btn-primary {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;

      &:hover {
        background: $primary-light;
        border-color: $primary-light;
      }
    }

    &.btn-secondary {
      background: $bg-secondary;
      border-color: $border-color-base;
      color: $text-secondary;

      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
    }

    &.btn-small {
      padding: $spacing-xs $spacing-md;
      font-size: $font-size-xs;

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  // 区块样式
  .info-section,
  .fields-section,
  .relations-section {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  .section-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0 0 $spacing-lg 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    .section-title {
      margin: 0;
    }
  }

  // 表单网格
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
  }

  .form-group {
    label {
      display: block;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-secondary;
      margin-bottom: $spacing-xs;
    }

    &.form-group-full {
      grid-column: 1 / -1;
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-md;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    outline: none;
    transition: all $transition-base ease;

    &:focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }

  textarea {
    resize: vertical;
    min-height: 60px;
  }

  // 表格
  .table-container {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: $font-size-sm;

    th,
    td {
      padding: $spacing-sm $spacing-md;
      text-align: left;
      border-bottom: 1px solid $border-color-light;
    }

    th {
      font-weight: $font-weight-semibold;
      color: $text-secondary;
      background: $bg-tertiary;
    }

    td {
      color: $text-primary;
    }

    tr:hover td {
      background: $bg-tertiary;
    }
  }

  .field-name {
    font-weight: $font-weight-medium;
  }

  .type-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    &.type-string {
      background: rgba(82, 196, 26, 0.1);
      color: #52c41a;
    }

    &.type-number {
      background: rgba(24, 144, 255, 0.1);
      color: $primary-color;
    }

    &.type-boolean {
      background: rgba(250, 173, 20, 0.1);
      color: #faad14;
    }

    &.type-date {
      background: rgba(114, 46, 209, 0.1);
      color: #722ed1;
    }

    &.type-enum {
      background: rgba(235, 47, 150, 0.1);
      color: #eb2f96;
    }

    &.type-object,
    &.type-array {
      background: rgba(19, 194, 194, 0.1);
      color: #13c2c2;
    }
  }

  .required-badge {
    color: #52c41a;
    font-weight: $font-weight-bold;
  }

  .optional-badge {
    color: $text-tertiary;
  }

  .description-cell {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .relation-badge {
    display: inline-block;
    padding: 2px 8px;
    background: rgba(24, 144, 255, 0.1);
    color: $primary-color;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
  }

  .cascade-tags {
    display: flex;
    gap: $spacing-xs;
    flex-wrap: wrap;
  }

  .cascade-tag {
    padding: 2px 6px;
    background: rgba(250, 173, 20, 0.1);
    color: #faad14;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
  }

  .cascade-none {
    color: $text-tertiary;
  }

  .action-btns {
    display: flex;
    gap: $spacing-xs;
  }

  .action-btn {
    padding: $spacing-xs $spacing-sm;
    background: transparent;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.action-btn-danger:hover {
      border-color: $error;
      color: $error;
    }
  }

  // 空状态
  .empty-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl;
    color: $text-tertiary;

    p {
      margin: 0 0 $spacing-md 0;
    }
  }

  // 弹窗
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-lg;
    border-bottom: 1px solid $border-color-light;

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }
  }

  .close-btn {
    background: none;
    border: none;
    color: $text-tertiary;
    font-size: 20px;
    cursor: pointer;
    padding: $spacing-xs;
    line-height: 1;

    &:hover {
      color: $text-primary;
    }
  }

  .dialog-body {
    padding: $spacing-lg;
    overflow-y: auto;
    flex: 1;
  }

  .required {
    color: $error;
  }

  // 复选框
  .form-group-checkbox {
    display: flex;
    align-items: flex-end;

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      padding: $spacing-sm 0;
      cursor: pointer;

      input[type='checkbox'] {
        width: auto;
      }
    }
  }

  .form-group-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      cursor: pointer;

      input[type='checkbox'] {
        width: auto;
      }

      small {
        margin-left: auto;
        color: $text-tertiary;
        font-size: $font-size-xs;
      }
    }
  }

  // 高级选项
  .advanced-section {
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid $border-color-light;
  }

  .advanced-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: $spacing-sm 0;
    background: none;
    border: none;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;

    &:hover {
      color: $text-primary;
    }
  }

  .toggle-icon {
    transition: transform $transition-base ease;

    &.open {
      transform: rotate(180deg);
    }
  }

  .advanced-content {
    padding-top: $spacing-md;
  }

  // 单选组
  .radio-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover,
    &.active {
      border-color: $primary-color;
    }

    input[type='radio'] {
      width: auto;
    }

    .radio-text {
      font-weight: $font-weight-medium;
    }

    small {
      margin-left: auto;
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
    padding: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  // 未找到
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: $spacing-3xl;
    color: $text-tertiary;

    svg {
      width: 80px;
      height: 80px;
      margin-bottom: $spacing-md;
    }

    p {
      font-size: $font-size-lg;
      margin: 0 0 $spacing-lg 0;
    }
  }
</style>
