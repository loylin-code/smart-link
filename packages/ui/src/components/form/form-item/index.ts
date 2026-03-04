import SlFormItem from './form-item.vue'
import type { App } from 'vue'

SlFormItem.install = (app: App) => {
  app.component('SlFormItem', SlFormItem)
}

export default SlFormItem
