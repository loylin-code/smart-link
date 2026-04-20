<template>
  <div class="skill-file-tree">
    <div class="tree-header">
      <span class="tree-title">文件结构</span>
    </div>
    <div class="tree-content">
      <TreeNode
        v-for="node in tree"
        :key="node.path || node.name"
        :node="node"
        :selected="selectedPath"
        @select="handleSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { SkillFileNode } from '@/types'
  import TreeNode from './TreeNode.vue'

  interface Props {
    tree: SkillFileNode[]
    selectedPath?: string
  }

  defineProps<Props>()
  const emit = defineEmits<{ select: [path: string] }>()
  const handleSelect = (path: string) => emit('select', path)
</script>

<style scoped lang="scss">
  .skill-file-tree {
    width: 240px;
    border-right: 1px solid $border-color-base;
    background: $bg-primary;
  }
  .tree-header {
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid $border-color-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
  .tree-content {
    padding: $spacing-sm 0;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }
</style>
