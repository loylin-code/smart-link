import { defineStore } from 'pinia'
import type {
  DataModel,
  DataModelCategory,
  DataModelField,
  DataModelRelation,
  DataModelType
} from '@/types'

interface DataModelState {
  models: DataModel[]
  categories: DataModelCategory[]
  currentModel: DataModel | null
  loading: boolean
  filter: {
    category?: string
    type?: DataModelType
    keyword: string
  }
}

// Mock categories
const mockCategories: DataModelCategory[] = [
  { id: 'location', name: '位置类', icon: '📍', description: '物理位置相关', modelCount: 3 },
  { id: 'asset', name: '资产类', icon: '🖥️', description: 'IT资产相关', modelCount: 5 },
  { id: 'product', name: '产品类', icon: '📦', description: '产品服务相关', modelCount: 2 },
  { id: 'personnel', name: '人员类', icon: '👤', description: '人员组织相关', modelCount: 2 },
  { id: 'process', name: '流程类', icon: '🔄', description: '业务流程相关', modelCount: 3 }
]

// Mock data models
const mockModels: DataModel[] = [
  {
    id: '1',
    name: 'user_info',
    displayName: '用户信息',
    type: 'entity',
    category: 'personnel',
    description: '存储用户基本信息的实体模型',
    version: '1.0.0',
    fields: [
      {
        id: 'f1',
        name: 'userId',
        displayName: '用户ID',
        type: 'string',
        required: true,
        description: '用户唯一标识',
        validation: { minLength: 1, maxLength: 50 }
      },
      {
        id: 'f2',
        name: 'name',
        displayName: '姓名',
        type: 'string',
        required: true,
        description: '用户姓名'
      },
      {
        id: 'f3',
        name: 'email',
        displayName: '邮箱',
        type: 'string',
        required: true,
        description: '邮箱地址',
        validation: { pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' }
      },
      {
        id: 'f4',
        name: 'phone',
        displayName: '手机号',
        type: 'string',
        required: false,
        description: '手机号码'
      },
      {
        id: 'f5',
        name: 'avatar',
        displayName: '头像',
        type: 'string',
        required: false,
        description: '头像URL'
      },
      {
        id: 'f6',
        name: 'status',
        displayName: '状态',
        type: 'enum',
        required: false,
        defaultValue: 'active',
        description: '用户状态',
        validation: { enumValues: ['active', 'inactive', 'suspended'] }
      }
    ],
    relations: [
      {
        id: 'r1',
        targetModel: 'order_info',
        relationType: '1:N',
        foreignKey: 'userId',
        targetKey: 'userId',
        cascadeDelete: false,
        cascadeUpdate: false
      },
      {
        id: 'r2',
        targetModel: 'organization',
        relationType: 'N:1',
        foreignKey: 'orgId',
        targetKey: 'orgId',
        cascadeDelete: false,
        cascadeUpdate: false
      }
    ],
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 3600000
  },
  {
    id: '2',
    name: 'order_info',
    displayName: '订单信息',
    type: 'entity',
    category: 'process',
    description: '订单信息的实体模型',
    version: '1.0.0',
    fields: [
      {
        id: 'f1',
        name: 'orderId',
        displayName: '订单ID',
        type: 'string',
        required: true,
        description: '订单唯一标识'
      },
      {
        id: 'f2',
        name: 'userId',
        displayName: '用户ID',
        type: 'string',
        required: true,
        description: '关联用户'
      },
      {
        id: 'f3',
        name: 'amount',
        displayName: '金额',
        type: 'number',
        required: true,
        description: '订单金额',
        validation: { min: 0 }
      },
      {
        id: 'f4',
        name: 'status',
        displayName: '状态',
        type: 'enum',
        required: true,
        description: '订单状态',
        validation: { enumValues: ['pending', 'paid', 'shipped', 'completed', 'cancelled'] }
      },
      {
        id: 'f5',
        name: 'createdAt',
        displayName: '创建时间',
        type: 'date',
        required: true,
        description: '订单创建时间'
      }
    ],
    relations: [
      {
        id: 'r1',
        targetModel: 'user_info',
        relationType: 'N:1',
        foreignKey: 'userId',
        targetKey: 'userId',
        cascadeDelete: false,
        cascadeUpdate: false
      }
    ],
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 7200000
  },
  {
    id: '3',
    name: 'server_asset',
    displayName: '服务器资产',
    type: 'entity',
    category: 'asset',
    description: '服务器资产信息的实体模型',
    version: '1.0.0',
    fields: [
      {
        id: 'f1',
        name: 'serverId',
        displayName: '服务器ID',
        type: 'string',
        required: true,
        description: '服务器唯一标识'
      },
      {
        id: 'f2',
        name: 'hostname',
        displayName: '主机名',
        type: 'string',
        required: true,
        description: '服务器主机名'
      },
      {
        id: 'f3',
        name: 'ipAddress',
        displayName: 'IP地址',
        type: 'string',
        required: true,
        description: 'IP地址'
      },
      {
        id: 'f4',
        name: 'cpu',
        displayName: 'CPU',
        type: 'string',
        required: false,
        description: 'CPU配置'
      },
      {
        id: 'f5',
        name: 'memory',
        displayName: '内存',
        type: 'number',
        required: false,
        description: '内存大小(GB)'
      },
      {
        id: 'f6',
        name: 'disk',
        displayName: '磁盘',
        type: 'number',
        required: false,
        description: '磁盘大小(GB)'
      },
      {
        id: 'f7',
        name: 'os',
        displayName: '操作系统',
        type: 'string',
        required: false,
        description: '操作系统类型'
      },
      {
        id: 'f8',
        name: 'location',
        displayName: '位置',
        type: 'string',
        required: false,
        description: '物理位置'
      }
    ],
    relations: [
      {
        id: 'r1',
        targetModel: 'datacenter',
        relationType: 'N:1',
        foreignKey: 'datacenterId',
        targetKey: 'dcId',
        cascadeDelete: false,
        cascadeUpdate: false
      }
    ],
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000
  },
  {
    id: '4',
    name: 'datacenter',
    displayName: '数据中心',
    type: 'entity',
    category: 'location',
    description: '数据中心位置信息',
    version: '1.0.0',
    fields: [
      {
        id: 'f1',
        name: 'dcId',
        displayName: '数据中心ID',
        type: 'string',
        required: true,
        description: '数据中心唯一标识'
      },
      {
        id: 'f2',
        name: 'name',
        displayName: '名称',
        type: 'string',
        required: true,
        description: '数据中心名称'
      },
      {
        id: 'f3',
        name: 'address',
        displayName: '地址',
        type: 'string',
        required: false,
        description: '物理地址'
      },
      {
        id: 'f4',
        name: 'region',
        displayName: '区域',
        type: 'string',
        required: false,
        description: '地理区域'
      }
    ],
    relations: [],
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 43200000
  }
]

export const useDataModelStore = defineStore('datamodel', {
  state: (): DataModelState => ({
    models: mockModels,
    categories: mockCategories,
    currentModel: null,
    loading: false,
    filter: {
      keyword: ''
    }
  }),

  getters: {
    filteredModels(state): DataModel[] {
      let result = state.models

      if (state.filter.category) {
        result = result.filter((m) => m.category === state.filter.category)
      }

      if (state.filter.type) {
        result = result.filter((m) => m.type === state.filter.type)
      }

      if (state.filter.keyword) {
        const keyword = state.filter.keyword.toLowerCase()
        result = result.filter(
          (m) =>
            m.name.toLowerCase().includes(keyword) ||
            m.displayName.toLowerCase().includes(keyword) ||
            m.description.toLowerCase().includes(keyword)
        )
      }

      return result
    },

    modelsByCategory(state): Record<string, DataModel[]> {
      const result: Record<string, DataModel[]> = {}
      state.categories.forEach((cat) => {
        result[cat.id] = state.models.filter((m) => m.category === cat.id)
      })
      return result
    },

    getCategoryById(state) {
      return (id: string): DataModelCategory | undefined => {
        return state.categories.find((c) => c.id === id)
      }
    },

    stats(state) {
      return {
        totalModels: state.models.length,
        totalCategories: state.categories.length,
        totalFields: state.models.reduce((sum, m) => sum + m.fields.length, 0),
        totalRelations: state.models.reduce((sum, m) => sum + m.relations.length, 0)
      }
    }
  },

  actions: {
    setFilter(filter: Partial<DataModelState['filter']>) {
      this.filter = { ...this.filter, ...filter }
    },

    getModelById(id: string): DataModel | undefined {
      return this.models.find((m) => m.id === id)
    },

    setCurrentModel(model: DataModel | null) {
      this.currentModel = model
    },

    addModel(model: DataModel) {
      this.models.push(model)
      // Update category count
      const category = this.categories.find((c) => c.id === model.category)
      if (category) {
        category.modelCount++
      }
    },

    updateModel(id: string, data: Partial<DataModel>) {
      const index = this.models.findIndex((m) => m.id === id)
      if (index !== -1) {
        this.models[index] = { ...this.models[index], ...data, updatedAt: Date.now() }
      }
    },

    deleteModel(id: string) {
      const index = this.models.findIndex((m) => m.id === id)
      if (index !== -1) {
        const model = this.models[index]
        // Update category count
        const category = this.categories.find((c) => c.id === model.category)
        if (category) {
          category.modelCount--
        }
        this.models.splice(index, 1)
      }
    },

    // Field operations
    addField(modelId: string, field: DataModelField) {
      const model = this.getModelById(modelId)
      if (model) {
        model.fields.push(field)
        model.updatedAt = Date.now()
      }
    },

    updateField(modelId: string, fieldId: string, data: Partial<DataModelField>) {
      const model = this.getModelById(modelId)
      if (model) {
        const index = model.fields.findIndex((f) => f.id === fieldId)
        if (index !== -1) {
          model.fields[index] = { ...model.fields[index], ...data }
          model.updatedAt = Date.now()
        }
      }
    },

    deleteField(modelId: string, fieldId: string) {
      const model = this.getModelById(modelId)
      if (model) {
        const index = model.fields.findIndex((f) => f.id === fieldId)
        if (index !== -1) {
          model.fields.splice(index, 1)
          model.updatedAt = Date.now()
        }
      }
    },

    // Relation operations
    addRelation(modelId: string, relation: DataModelRelation) {
      const model = this.getModelById(modelId)
      if (model) {
        model.relations.push(relation)
        model.updatedAt = Date.now()
      }
    },

    updateRelation(modelId: string, relationId: string, data: Partial<DataModelRelation>) {
      const model = this.getModelById(modelId)
      if (model) {
        const index = model.relations.findIndex((r) => r.id === relationId)
        if (index !== -1) {
          model.relations[index] = { ...model.relations[index], ...data }
          model.updatedAt = Date.now()
        }
      }
    },

    deleteRelation(modelId: string, relationId: string) {
      const model = this.getModelById(modelId)
      if (model) {
        const index = model.relations.findIndex((r) => r.id === relationId)
        if (index !== -1) {
          model.relations.splice(index, 1)
          model.updatedAt = Date.now()
        }
      }
    },

    // Category operations
    addCategory(category: DataModelCategory) {
      this.categories.push(category)
    },

    updateCategory(id: string, data: Partial<DataModelCategory>) {
      const index = this.categories.findIndex((c) => c.id === id)
      if (index !== -1) {
        this.categories[index] = { ...this.categories[index], ...data }
      }
    },

    deleteCategory(id: string) {
      const index = this.categories.findIndex((c) => c.id === id)
      if (index !== -1) {
        this.categories.splice(index, 1)
      }
    }
  }
})
