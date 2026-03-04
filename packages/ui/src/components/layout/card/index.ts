import SlCard from './card.vue'
import type { App } from 'vue'

SlCard.install = (app: App) => {
  app.component('SlCard', SlCard)
}

export default SlCard
