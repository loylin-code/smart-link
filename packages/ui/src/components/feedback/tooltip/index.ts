import SlTooltip from './src/tooltip.vue'
import type { App } from 'vue'

SlTooltip.install = (app: App) => {
  app.component('SlTooltip', SlTooltip)
}

export default SlTooltip
