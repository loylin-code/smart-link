import SlLink from './link.vue'
import type { App } from 'vue'

SlLink.install = (app: App) => {
  app.component('SlLink', SlLink)
}

export default SlLink
