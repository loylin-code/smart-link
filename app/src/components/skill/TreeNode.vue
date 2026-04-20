<template>
  <div class="tree-node">
    <div :class="['node-content', { selected: selected === node.path }]" @click="handleClick">
      <span class="node-icon">{{ icon }}</span>
      <span class="node-name">{{ node.name }}</span>
      <svg
        v-if="isDirectory"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        :class="['expand-icon', { expanded }]"
      >
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </div>
    <div v-if="isDirectory && expanded" class="node-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.path || child.name"
        :node="child"
        :selected="selected"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { SkillFileNode } from '@/types'

  interface Props {
    node: SkillFileNode
    selected?: string
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{ select: [path: string] }>()
  const expanded = ref(props.node.type === 'directory')
  const isDirectory = computed(() => props.node.type === 'directory')

  const icon = computed(() => {
    if (props.node.type === 'directory') return '📁'
    const ext = props.node.name.split('.').pop()?.toLowerCase()
    const icons: Record<string, string> = { md: '📄', py: '🐍', js: '📜', json: '📋', yaml: '⚙️' }
    return icons[ext || ''] || '📄'
  })

  const handleClick = () => {
    if (isDirectory.value) expanded.value = !expanded.value
    else if (props.node.path) emit('select', props.node.path)
  }
</script>

<style scoped lang="scss">
  .node-content {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    cursor: pointer;
    transition: background-color $transition-base;

    &:hover {
      background-color: $bg-tertiary;
    }
    &.selected {
      background-color: $primary-muted;
      border-left: 3px solid $primary-color;
    }
  }

  .node-icon {
    font-size: $font-size-base;
  }

  .node-name {
    flex: 1;
    font-size: $font-size-sm;
    color: $text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .expand-icon {
    width: 16px;
    height: 16px;
    color: $text-tertiary;
    transition: transform $transition-base;

    &.expanded {
      transform: rotate(90deg);
    }
  }

  .node-children {
    padding-left: $spacing-lg;
  }
</style>
