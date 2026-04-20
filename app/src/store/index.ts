import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia

// 导出所有 store
export * from './modules/app'
export * from './modules/agent'
export * from './modules/explore'
export * from './modules/orchestrator'
export * from './modules/api'
export * from './modules/semantic'
