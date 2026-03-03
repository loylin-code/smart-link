import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export { ref, onMounted, onUnmounted }
export type { Ref }

export const useToggle = (initialValue = false): [Ref<boolean>, () => void] => {
  const value = ref(initialValue)
  const toggle = () => {
    value.value = !value.value
  }
  return [value, toggle]
}

export const useCounter = (
  initialValue = 0
): {
  count: Ref<number>
  increment: () => void
  decrement: () => void
  reset: () => void
} => {
  const count = ref(initialValue)
  const increment = () => {
    count.value++
  }
  const decrement = () => {
    count.value--
  }
  const reset = () => {
    count.value = initialValue
  }
  return { count, increment, decrement, reset }
}

export const useMousePosition = (): { x: Ref<number>; y: Ref<number> } => {
  const x = ref(0)
  const y = ref(0)

  const update = (event: MouseEvent) => {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}
