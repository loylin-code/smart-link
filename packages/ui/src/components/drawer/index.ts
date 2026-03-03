import SlDrawer from './src/drawer.vue'
import type { App } from 'vue'

SlDrawer.install = (app: App) => {
  app.component('SlDrawer', SlDrawer)
}

export default SlDrawer
