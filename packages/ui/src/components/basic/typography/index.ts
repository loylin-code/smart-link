import SlTypography from './typography.vue'
import type { App } from 'vue'

SlTypography.install = (app: App) => {
  app.component('SlTypography', SlTypography)
}

export default SlTypography
