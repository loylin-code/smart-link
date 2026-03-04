import SlIcon from './icon.vue'
import type { App } from 'vue'

SlIcon.install = (app: App) => {
  app.component('SlIcon', SlIcon)
}

export default SlIcon
