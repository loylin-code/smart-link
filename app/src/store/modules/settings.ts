import { defineStore } from 'pinia'
import type { AppearanceSettings, ModelProviderConfig } from '@/types'

interface SettingsState {
  appearance: AppearanceSettings
  modelProviders: ModelProviderConfig[]
}

// Mock data for development
const mockModelProviders: ModelProviderConfig[] = [
  {
    id: '1',
    name: 'OpenAI',
    provider: 'openai',
    apiKey: 'sk-****',
    baseUrl: 'https://api.openai.com/v1',
    availableModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    configured: true
  },
  {
    id: '2',
    name: 'Anthropic',
    provider: 'anthropic',
    apiKey: 'sk-ant-****',
    availableModels: ['claude-sonnet-4.5', 'claude-opus-4', 'claude-haiku-3.5'],
    configured: true
  },
  {
    id: '3',
    name: 'Ollama',
    provider: 'ollama',
    apiKey: '',
    baseUrl: 'http://localhost:11434',
    availableModels: [],
    configured: false
  },
  {
    id: '4',
    name: '阿里云',
    provider: 'alibaba',
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    availableModels: ['qwen-2.5-72b', 'qwen-2.5-7b', 'qwen-vl-max'],
    configured: false
  }
]

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    appearance: {
      theme: 'light',
      primaryColor: '#1890ff',
      language: 'zh-CN',
      fontSize: 'medium'
    },
    modelProviders: mockModelProviders
  }),

  getters: {
    currentTheme(state): 'light' | 'dark' {
      return state.appearance.theme
    },

    configuredProviders(state): ModelProviderConfig[] {
      return state.modelProviders.filter((p) => p.configured)
    },

    unconfiguredProviders(state): ModelProviderConfig[] {
      return state.modelProviders.filter((p) => !p.configured)
    }
  },

  actions: {
    setTheme(theme: AppearanceSettings['theme']) {
      this.appearance.theme = theme
      this.applyTheme()
    },

    toggleTheme() {
      this.appearance.theme = this.appearance.theme === 'light' ? 'dark' : 'light'
      this.applyTheme()
    },

    setPrimaryColor(color: string) {
      this.appearance.primaryColor = color
    },

    setLanguage(language: AppearanceSettings['language']) {
      this.appearance.language = language
    },

    setFontSize(size: AppearanceSettings['fontSize']) {
      this.appearance.fontSize = size
    },

    applyTheme() {
      if (typeof document !== 'undefined') {
        const theme = this.currentTheme
        document.documentElement.classList.add('theme-transition')
        document.documentElement.setAttribute('data-theme', theme)
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition')
        }, 300)
      }
    },

    // Model provider actions
    getProviderById(id: string): ModelProviderConfig | undefined {
      return this.modelProviders.find((p) => p.id === id)
    },

    addProvider(provider: ModelProviderConfig) {
      this.modelProviders.push(provider)
    },

    updateProvider(id: string, data: Partial<ModelProviderConfig>) {
      const index = this.modelProviders.findIndex((p) => p.id === id)
      if (index !== -1) {
        this.modelProviders[index] = { ...this.modelProviders[index], ...data }
      }
    },

    deleteProvider(id: string) {
      const index = this.modelProviders.findIndex((p) => p.id === id)
      if (index !== -1) {
        this.modelProviders.splice(index, 1)
      }
    },

    async testProviderConnection(id: string): Promise<{ success: boolean; message: string }> {
      const provider = this.getProviderById(id)
      if (!provider) {
        return { success: false, message: '提供商不存在' }
      }

      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      const success = Math.random() > 0.3
      if (success) {
        this.updateProvider(id, { configured: true })
        return { success: true, message: '连接成功' }
      }
      return { success: false, message: '连接失败，请检查配置' }
    },

    // Initialize settings from localStorage
    init() {
      this.applyTheme()
    }
  },

  // Enable persistence
  persist: {
    key: 'smartlink-settings',
    paths: ['appearance', 'modelProviders']
  }
})
