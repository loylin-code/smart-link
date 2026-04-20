<script setup lang="ts">
  import { computed } from 'vue'

  interface Column {
    key: string
    title: string
    width?: string | number
  }

  interface Props {
    dataSource: Record<string, any>[]
    columns: Column[]
    striped?: boolean
    hoverable?: boolean
    bordered?: boolean
    emptyText?: string
  }

  interface RowData {
    row: Record<string, any>
    index: number
  }

  const props = withDefaults(defineProps<Props>(), {
    striped: true,
    hoverable: true,
    bordered: false,
    emptyText: '暂无数据'
  })

  const emit = defineEmits<{
    rowClick: [row: Record<string, any>]
  }>()

  const isEmpty = computed<boolean>(() => props.dataSource.length === 0)

  const tableRows = computed<RowData[]>(() =>
    props.dataSource.map((row: Record<string, any>, index: number) => ({ row, index }))
  )

  const isStripedRow = (index: number): boolean => {
    return props.striped && index % 2 === 1
  }

  const handleRowClick = (row: Record<string, any>): void => {
    emit('rowClick', row)
  }
</script>

<template>
  <div
    class="sl-table"
    :class="{
      'sl-table--bordered': bordered,
      'sl-table--striped': striped,
      'sl-table--hoverable': hoverable
    }"
  >
    <table class="sl-table__inner">
      <thead class="sl-table__header">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="sl-table__cell sl-table__cell--header"
            :style="{ width: col.width }"
          >
            {{ col.title }}
          </th>
        </tr>
      </thead>
      <tbody class="sl-table__body">
        <template v-if="isEmpty">
          <tr class="sl-table__row sl-table__row--empty">
            <td class="sl-table__cell sl-table__cell--empty" :colspan="columns.length">
              {{ emptyText }}
            </td>
          </tr>
        </template>
        <template v-else>
          <tr
            v-for="rowData in tableRows"
            :key="rowData.index"
            class="sl-table__row"
            :class="{
              'sl-table__row--striped': isStripedRow(rowData.index),
              'sl-table__row--hoverable': hoverable
            }"
            @click="handleRowClick(rowData.row)"
          >
            <td v-for="col in columns" :key="col.key" class="sl-table__cell sl-table__cell--body">
              {{ rowData.row[col.key] }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
  .sl-table {
    width: 100%;
    overflow-x: auto;
  }

  .sl-table__inner {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  /* Header */
  .sl-table__header {
    background-color: #f5f7fa;
  }

  .sl-table__cell--header {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #e4e7ed;
  }

  /* Body */
  .sl-table__cell--body {
    padding: 12px 16px;
    color: #666;
    border-bottom: 1px solid #ebeef5;
  }

  .sl-table__row {
    transition: background-color 0.2s ease;
  }

  .sl-table__row--striped {
    background-color: #fafafa;
  }

  .sl-table__row--hoverable:hover {
    background-color: #f5f7fa;
    cursor: pointer;
  }

  /* Empty state */
  .sl-table__row--empty {
    text-align: center;
  }

  .sl-table__cell--empty {
    padding: 40px 16px;
    color: #999;
    font-size: 14px;
  }

  /* Bordered */
  .sl-table--bordered .sl-table__cell {
    border-right: 1px solid #ebeef5;
  }

  .sl-table--bordered .sl-table__inner {
    border: 1px solid #ebeef5;
  }

  .sl-table--bordered .sl-table__header {
    border-bottom: 1px solid #dcdfe6;
  }
</style>
