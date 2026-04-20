import type { App } from 'vue'
import SlChart from './chart.vue'

SlChart.install = (app: App) => {
  app.component('SlChart', SlChart)
}

export default SlChart
