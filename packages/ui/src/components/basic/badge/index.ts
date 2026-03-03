import SlBadge from './src/badge.vue'
import type { App } from 'vue'

SlBadge.install = (app: App) => {
  app.component('SlBadge', SlBadge)
}

export default SlBadge
