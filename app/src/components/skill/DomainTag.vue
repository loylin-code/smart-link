<template>
  <span :class="['domain-tag', `domain-tag--${domain}`]" :style="tagStyle">
    <span class="domain-icon">{{ config.icon }}</span>
    <span v-if="showLabel" class="domain-label">{{ config.label }}</span>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { SkillDomain } from '@/types'

  interface Props {
    domain: SkillDomain
    showLabel?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showLabel: true
  })

  const DOMAIN_CONFIG: Record<
    SkillDomain,
    { icon: string; label: string; color: string; bgColor: string }
  > = {
    resource: {
      icon: '📦',
      label: '资源领域',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.08)'
    },
    asset: { icon: '💎', label: '资产领域', color: '#d97706', bgColor: 'rgba(217, 119, 6, 0.08)' },
    operation: {
      icon: '🛠️',
      label: '运维领域',
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.08)'
    },
    infrastructure: {
      icon: '⚡',
      label: '基础服务',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.08)'
    }
  }

  const config = computed(() => DOMAIN_CONFIG[props.domain] || DOMAIN_CONFIG.resource)
  const tagStyle = computed(() => ({
    backgroundColor: config.value.bgColor,
    color: config.value.color,
    border: `1px solid ${config.value.color}20`
  }))
</script>

<style scoped lang="scss">
  .domain-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
</style>
