import SlImage from './src/image.vue'
import type { App } from 'vue'

SlImage.install = (app: App) => {
  app.component('SlImage', SlImage)
}

export default SlImage
