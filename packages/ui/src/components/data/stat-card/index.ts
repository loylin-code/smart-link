import type { App } from 'vue'
import SlStatCard from './stat-card.vue'
;(SlStatCard as any).install = (app: App) => {
  app.component('SlStatCard', SlStatCard)
}

export default SlStatCard
