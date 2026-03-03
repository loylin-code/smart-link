<template>
  <div class="resource-management">
    <div class="page-header">
      <h1 class="page-title">Skills管理</h1>
      <button class="create-btn">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>创建Skill</span>
      </button>
    </div>

    <div class="filter-bar">
      <input type="text" placeholder="搜索Skills..." class="search-input" />
      <select class="filter-select">
        <option>全部类型</option>
        <option>分析</option>
        <option>处理</option>
        <option>调用</option>
      </select>
    </div>

    <div class="resource-table">
      <div class="table-header">
        <div class="table-row">
          <div class="table-cell">名称</div>
          <div class="table-cell">类型</div>
          <div class="table-cell">状态</div>
          <div class="table-cell">操作</div>
        </div>
      </div>
      <div class="table-body">
        <div v-for="skill in skills" :key="skill.id" class="table-row">
          <div class="table-cell">{{ skill.name }}</div>
          <div class="table-cell">{{ skill.type }}</div>
          <div class="table-cell">
            <span class="status-badge" :class="`status-badge--${skill.status}`">
              {{ skill.status === 'active' ? '启用' : '禁用' }}
            </span>
          </div>
          <div class="table-cell">
            <button class="table-action">编辑</button>
            <button class="table-action table-action--danger">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { Skill } from '@/types'

  const skills = ref<Skill[]>([
    {
      id: '1',
      name: '数据分析Skill',
      description: '数据分析能力',
      type: '分析',
      status: 'active',
      config: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: '2',
      name: '文档处理Skill',
      description: '文档处理能力',
      type: '处理',
      status: 'active',
      config: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: '3',
      name: 'API调用Skill',
      description: 'API调用能力',
      type: '调用',
      status: 'inactive',
      config: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ])
</script>

<style scoped lang="scss">
  .resource-management {
    height: 100%;
    padding: $spacing-xl;
    overflow-y: auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
  }

  .page-title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    border: 1px solid $primary-color;
    border-radius: $border-radius-md;
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background: $primary-light;
      border-color: $primary-light;
    }
  }

  .filter-bar {
    display: flex;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  .search-input {
    flex: 1;
    max-width: 400px;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      border-color: $primary-color;
    }
  }

  .filter-select {
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    cursor: pointer;

    &:focus {
      border-color: $primary-color;
    }
  }

  .resource-table {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    overflow: hidden;
  }

  .table-header {
    background: $bg-tertiary;
    border-bottom: 1px solid $border-color-light;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: $spacing-md;
    padding: $spacing-md $spacing-lg;
    align-items: center;

    &:not(:last-child) {
      border-bottom: 1px solid $border-color-light;
    }
  }

  .table-body .table-row {
    transition: background $transition-base ease;

    &:hover {
      background: $bg-tertiary;
    }
  }

  .table-cell {
    font-size: $font-size-sm;
    color: $text-primary;
  }

  .status-badge {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    &--active {
      background: rgba(16, 185, 129, 0.1);
      color: $success;
    }

    &--inactive {
      background: rgba(107, 113, 148, 0.1);
      color: $text-tertiary;
    }
  }

  .table-action {
    padding: $spacing-xs $spacing-sm;
    background: transparent;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: color $transition-base ease;
    margin-right: $spacing-sm;

    &:hover {
      color: $primary-color;
    }

    &--danger:hover {
      color: $error;
    }
  }
</style>
