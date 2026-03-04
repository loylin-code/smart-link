import SlDrawer from './drawer.vue'
import type { App } from 'vue'

SlDrawer.install = (app: App) => {
  app.component('SlDrawer', SlDrawer)
}

export default SlDrawer
