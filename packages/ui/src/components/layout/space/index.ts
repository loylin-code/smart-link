import SlSpace from './src/space.vue'
import type { App } from 'vue'

SlSpace.install = (app: App) => {
  app.component('SlSpace', SlSpace)
}

export default SlSpace
