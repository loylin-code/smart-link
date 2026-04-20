import SlTable from './table.vue'
;(SlTable as any).install = (app: any) => {
  app.component('SlTable', SlTable)
}

export default SlTable
