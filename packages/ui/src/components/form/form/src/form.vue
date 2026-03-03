<template>
  <form class="sl-form" @submit.prevent="handleSubmit">
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
  import { provide, reactive } from 'vue'

  interface Props {
    model?: Record<string, any>
    labelWidth?: string
    labelPosition?: 'left' | 'right' | 'top'
    rules?: Record<string, any>
  }

  const props = withDefaults(defineProps<Props>(), {
    model: () => ({}),
    labelWidth: '100px',
    labelPosition: 'right'
  })

  const emit = defineEmits<{
    submit: [event: Event]
  }>()

  provide(
    'form',
    reactive({
      model: props.model,
      rules: props.rules
    })
  )

  const handleSubmit = (event: Event) => {
    emit('submit', event)
  }
</script>

<style scoped lang="scss">
  .sl-form {
    width: 100%;
  }
</style>
