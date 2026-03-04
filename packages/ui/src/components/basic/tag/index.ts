import SlTag from './tag.vue'
import type { App } from 'vue'

SlTag.install = (app: App) => {
  app.component('SlTag', SlTag)
}

export default SlTag
