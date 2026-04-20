<template>
  <div class="version-timeline">
    <div class="timeline-header">
      <span class="timeline-title">版本时间线</span>
    </div>
    <div class="timeline-content">
      <el-timeline>
        <el-timeline-item
          v-for="version in versions"
          :key="version.id"
          :type="getStatusType(version.status)"
          :hollow="version.status !== 'online'"
        >
          <div class="version-item">
            <div class="version-header">
              <span class="version-number">v{{ version.version }}</span>
              <el-tag :type="getStatusType(version.status)" size="small">
                {{ getStatusLabel(version.status) }}
              </el-tag>
            </div>
            <div v-if="version.labels?.length" class="version-labels">
              <el-tag v-for="label in version.labels" :key="label" size="small" effect="plain">
                {{ label }}
              </el-tag>
            </div>
            <div class="version-meta">
              <span class="meta-date">{{ formatDate(version.createdAt) }}</span>
            </div>
            <div class="version-actions">
              <el-button
                v-if="version.status === 'online'"
                type="primary"
                size="small"
                plain
                @click="$emit('preview', version)"
              >
                预览
              </el-button>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { SkillVersion } from '@/types'

  interface Props {
    versions: SkillVersion[]
  }
  defineProps<Props>()
  defineEmits<{ preview: [version: SkillVersion] }>()

  const getStatusType = (status: string) => {
    const types: Record<string, string> = {
      online: 'success',
      draft: 'warning',
      reviewing: '',
      offline: 'info'
    }
    return types[status] || 'info'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      online: '已上线',
      draft: '草稿',
      reviewing: '审核中',
      offline: '已下线'
    }
    return labels[status] || status
  }

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('zh-CN')
</script>

<style scoped lang="scss">
  .version-timeline {
    width: 300px;
    border-left: 1px solid #e2e8f0;
    background: #ffffff;
  }
  .timeline-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600;
    color: #0f172a;
  }
  .timeline-content {
    padding: 16px;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }
  .version-item {
    .version-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .version-number {
      font-weight: 600;
      color: #0f172a;
    }
    .version-labels {
      margin-bottom: 8px;
    }
    .version-meta {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
  }
</style>
