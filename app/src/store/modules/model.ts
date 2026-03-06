import { defineStore } from 'pinia'
import type { LLMModel, ModelProvider, ModelStatus, ModelType } from '@/types'

interface ModelState {
  models: LLMModel[]
  currentModel: LLMModel | null
  loading: boolean
  filter: {
    provider?: ModelProvider
    type?: ModelType
    status?: ModelStatus
    keyword: string
  }
}

// Mock data for development
const mockModels: LLMModel[] = [
  {
    id: '1',
    name: 'GPT-4o',
    uniqueId: 'openai/gpt-4o-2024-05-13',
    provider: 'openai',
    series: 'GPT-4',
    type: 'chat',
    version: '2024-05-13',
    status: 'available',
    contextWindow: 128000,
    maxOutput: 16384,
    pricing: { input: 1.25, output: 10.0, currency: 'USD', unit: '1M' },
    capabilities: {
      chat: true,
      streaming: true,
      vision: true,
      tools: true,
      json: true,
      audio: false,
      video: false,
      reasoning: true
    },
    config: {
      apiKey: 'sk-****',
      baseUrl: 'https://api.openai.com/v1',
      defaultParams: { temperature: 0.7, maxTokens: 4096, topP: 1.0 },
      rateLimit: { rpm: 60, tpm: 90000, currentRpm: 45, currentTpm: 45000 },
      quota: { monthly: 500, remaining: 157.82, alertThreshold: 80 }
    },
    fallbackChain: ['gpt-4-turbo', 'claude-sonnet-4.5'],
    stats: {
      monthlyCost: 342.18,
      monthlyCalls: 12450,
      successRate: 99.2,
      avgLatency: 1.2,
      p50Latency: 0.8,
      p90Latency: 1.8,
      p99Latency: 3.2,
      throughput: 85
    },
    accessControl: {
      mode: 'allow',
      teams: ['AI 团队', '数据科学团队', '产品研发团队'],
      fallbackModel: 'gpt-3.5-turbo'
    },
    deployment: { type: 'cloud', region: 'us-east-1', environments: ['production', 'staging'] },
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 3600000
  },
  {
    id: '2',
    name: 'Claude Sonnet 4.5',
    uniqueId: 'anthropic/claude-sonnet-4.5',
    provider: 'anthropic',
    series: 'Claude',
    type: 'chat',
    version: '2024-10',
    status: 'available',
    contextWindow: 200000,
    maxOutput: 8192,
    pricing: { input: 3.0, output: 15.0, currency: 'USD', unit: '1M' },
    capabilities: {
      chat: true,
      streaming: true,
      vision: true,
      tools: true,
      json: true,
      audio: false,
      video: false,
      reasoning: true
    },
    config: {
      apiKey: 'sk-ant-****',
      defaultParams: { temperature: 0.7, maxTokens: 4096, topP: 1.0 },
      rateLimit: { rpm: 60, tpm: 100000 },
      quota: { monthly: 500, remaining: 343.5, alertThreshold: 80 }
    },
    fallbackChain: ['claude-opus-4', 'gpt-4o'],
    stats: {
      monthlyCost: 156.5,
      monthlyCalls: 8234,
      successRate: 99.5,
      avgLatency: 1.5,
      throughput: 78
    },
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 7200000
  },
  {
    id: '3',
    name: 'GPT-4 Turbo',
    uniqueId: 'openai/gpt-4-turbo-2024-04-09',
    provider: 'openai',
    series: 'GPT-4',
    type: 'chat',
    version: '2024-04-09',
    status: 'available',
    contextWindow: 128000,
    maxOutput: 4096,
    pricing: { input: 10.0, output: 30.0, currency: 'USD', unit: '1M' },
    capabilities: {
      chat: true,
      streaming: true,
      vision: true,
      tools: true,
      json: true,
      audio: false,
      video: false,
      reasoning: true
    },
    config: {
      apiKey: 'sk-****',
      baseUrl: 'https://api.openai.com/v1',
      defaultParams: { temperature: 0.7, maxTokens: 4096, topP: 1.0 },
      rateLimit: { rpm: 500, tpm: 30000 },
      quota: { monthly: 300, remaining: 210.8, alertThreshold: 80 }
    },
    fallbackChain: ['gpt-4o', 'claude-sonnet-4.5'],
    stats: {
      monthlyCost: 89.2,
      monthlyCalls: 3456,
      successRate: 99.8,
      avgLatency: 0.9,
      throughput: 92
    },
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 1800000
  },
  {
    id: '4',
    name: 'Gemini 2.0 Pro',
    uniqueId: 'google/gemini-2.0-pro',
    provider: 'google',
    series: 'Gemini',
    type: 'chat',
    version: '2024-12',
    status: 'available',
    contextWindow: 2000000,
    maxOutput: 65536,
    pricing: { input: 0.5, output: 3.0, currency: 'USD', unit: '1M' },
    capabilities: {
      chat: true,
      streaming: true,
      vision: true,
      tools: true,
      json: true,
      audio: true,
      video: true,
      reasoning: true
    },
    config: {
      apiKey: 'AIza****',
      defaultParams: { temperature: 0.7, maxTokens: 8192, topP: 1.0 },
      rateLimit: { rpm: 60, tpm: 1000000 },
      quota: { monthly: 200, remaining: 154.4, alertThreshold: 80 }
    },
    fallbackChain: ['gemini-1.5-flash', 'gpt-4o'],
    stats: {
      monthlyCost: 45.6,
      monthlyCalls: 5678,
      successRate: 99.6,
      avgLatency: 1.1,
      throughput: 95
    },
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 3600000
  },
  {
    id: '5',
    name: 'Qwen 2.5 72B',
    uniqueId: 'alibaba/qwen-2.5-72b-instruct',
    provider: 'alibaba',
    series: 'Qwen',
    type: 'chat',
    version: '2024-11',
    status: 'available',
    contextWindow: 32000,
    maxOutput: 8192,
    pricing: { input: 0.012, output: 0.048, currency: 'CNY', unit: '1K' },
    capabilities: {
      chat: true,
      streaming: true,
      vision: false,
      tools: true,
      json: true,
      audio: false,
      video: false,
      reasoning: true
    },
    config: {
      apiKey: 'sk-****',
      baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
      defaultParams: { temperature: 0.7, maxTokens: 4096, topP: 1.0 },
      rateLimit: { rpm: 100, tpm: 200000 },
      quota: { monthly: 1000, remaining: 843.2, alertThreshold: 80 }
    },
    fallbackChain: ['qwen-2.5-7b', 'gpt-4o-mini'],
    stats: {
      monthlyCost: 156.8,
      monthlyCalls: 6789,
      successRate: 99.3,
      avgLatency: 0.6,
      throughput: 120
    },
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 5400000
  },
  {
    id: '6',
    name: 'Qwen 2.5 7B (Local)',
    uniqueId: 'ollama/qwen2.5:7b',
    provider: 'ollama',
    series: 'Qwen',
    type: 'chat',
    version: 'latest',
    status: 'available',
    contextWindow: 8192,
    maxOutput: 4096,
    pricing: { input: 0, output: 0, currency: 'USD', unit: '1M' },
    capabilities: {
      chat: true,
      streaming: true,
      vision: false,
      tools: false,
      json: false,
      audio: false,
      video: false,
      reasoning: false
    },
    config: {
      apiKey: '',
      baseUrl: 'http://localhost:11434',
      defaultParams: { temperature: 0.7, maxTokens: 4096, topP: 1.0 },
      rateLimit: { rpm: 1000, tpm: 1000000 },
      quota: { alertThreshold: 80 }
    },
    fallbackChain: [],
    stats: {
      monthlyCost: 0,
      monthlyCalls: 1234,
      successRate: 98.5,
      avgLatency: 0.4,
      throughput: 45
    },
    deployment: { type: 'local', environments: ['development'] },
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000
  },
  {
    id: '7',
    name: 'GPT-4o-mini',
    uniqueId: 'openai/gpt-4o-mini-2024-07-18',
    provider: 'openai',
    series: 'GPT-4',
    type: 'chat',
    version: '2024-07-18',
    status: 'quota-warning',
    contextWindow: 16000,
    maxOutput: 4096,
    pricing: { input: 0.15, output: 0.6, currency: 'USD', unit: '1M' },
    capabilities: {
      chat: true,
      streaming: true,
      vision: true,
      tools: true,
      json: true,
      audio: false,
      video: false,
      reasoning: true
    },
    config: {
      apiKey: 'sk-****',
      defaultParams: { temperature: 0.7, maxTokens: 4096, topP: 1.0 },
      rateLimit: { rpm: 500, tpm: 200000 },
      quota: { monthly: 50, remaining: 0, alertThreshold: 80 }
    },
    fallbackChain: ['gpt-3.5-turbo'],
    stats: {
      monthlyCost: 50.0,
      monthlyCalls: 25000,
      successRate: 99.9,
      avgLatency: 0.3,
      throughput: 150
    },
    createdAt: Date.now() - 86400000 * 40,
    updatedAt: Date.now()
  },
  {
    id: '8',
    name: 'DALL-E 3',
    uniqueId: 'openai/dall-e-3',
    provider: 'openai',
    series: 'DALL-E',
    type: 'image',
    version: '2024-01',
    status: 'available',
    contextWindow: 4096,
    maxOutput: 1024,
    pricing: { input: 0.04, output: 0.04, currency: 'USD', unit: '1K' },
    capabilities: {
      chat: false,
      streaming: false,
      vision: false,
      tools: false,
      json: false,
      audio: false,
      video: false,
      reasoning: false
    },
    config: {
      apiKey: 'sk-****',
      defaultParams: { temperature: 1.0, maxTokens: 1024, topP: 1.0 },
      rateLimit: { rpm: 5, tpm: 5000 },
      quota: { monthly: 100, remaining: 87.2, alertThreshold: 80 }
    },
    fallbackChain: [],
    stats: {
      monthlyCost: 12.8,
      monthlyCalls: 320,
      successRate: 99.4,
      avgLatency: 10,
      throughput: 0.1
    },
    createdAt: Date.now() - 86400000 * 35,
    updatedAt: Date.now() - 7200000
  }
]

export const useModelStore = defineStore('model', {
  state: (): ModelState => ({
    models: mockModels,
    currentModel: null,
    loading: false,
    filter: {
      keyword: ''
    }
  }),

  getters: {
    filteredModels(state): LLMModel[] {
      let result = state.models

      if (state.filter.provider) {
        result = result.filter((m) => m.provider === state.filter.provider)
      }

      if (state.filter.type) {
        result = result.filter((m) => m.type === state.filter.type)
      }

      if (state.filter.status) {
        result = result.filter((m) => m.status === state.filter.status)
      }

      if (state.filter.keyword) {
        const keyword = state.filter.keyword.toLowerCase()
        result = result.filter(
          (m) =>
            m.name.toLowerCase().includes(keyword) ||
            m.series.toLowerCase().includes(keyword) ||
            m.provider.toLowerCase().includes(keyword)
        )
      }

      return result
    },

    modelsByProvider(state): Record<ModelProvider, LLMModel[]> {
      const providers: ModelProvider[] = [
        'openai',
        'anthropic',
        'google',
        'alibaba',
        'ollama',
        'custom'
      ]
      return Object.fromEntries(
        providers.map((p) => [p, state.models.filter((m) => m.provider === p)])
      ) as Record<ModelProvider, LLMModel[]>
    },

    chatModels(state): LLMModel[] {
      return state.models.filter((m) => m.type === 'chat')
    },

    stats(state) {
      return {
        total: state.models.length,
        available: state.models.filter((m) => m.status === 'available').length,
        degraded: state.models.filter((m) => m.status === 'degraded').length,
        unavailable: state.models.filter((m) => m.status === 'unavailable').length,
        totalMonthlyCost: state.models.reduce((sum, m) => sum + m.stats.monthlyCost, 0),
        totalCalls: state.models.reduce((sum, m) => sum + m.stats.monthlyCalls, 0)
      }
    }
  },

  actions: {
    setFilter(filter: Partial<ModelState['filter']>) {
      this.filter = { ...this.filter, ...filter }
    },

    getModelById(id: string): LLMModel | undefined {
      return this.models.find((m) => m.id === id)
    },

    setCurrentModel(model: LLMModel | null) {
      this.currentModel = model
    },

    addModel(model: LLMModel) {
      this.models.push(model)
    },

    updateModel(id: string, data: Partial<LLMModel>) {
      const index = this.models.findIndex((m) => m.id === id)
      if (index !== -1) {
        this.models[index] = { ...this.models[index], ...data, updatedAt: Date.now() }
      }
    },

    deleteModel(id: string) {
      const index = this.models.findIndex((m) => m.id === id)
      if (index !== -1) {
        this.models.splice(index, 1)
      }
    },

    async testConnection(id: string): Promise<{ success: boolean; message: string }> {
      const model = this.getModelById(id)
      if (!model) {
        return { success: false, message: '模型不存在' }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

      const success = Math.random() > 0.2
      if (success) {
        return { success: true, message: '连接成功' }
      }
      return { success: false, message: '连接失败' }
    }
  }
})
