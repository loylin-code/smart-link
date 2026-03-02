<template>
  <div class="resource-management">
    <div class="page-header">
      <h1 class="page-title">MCP管理</h1>
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
        <span>创建MCP</span>
      </button>
    </div>

    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path
          d="M12 6V12L16 14"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p>暂无MCP配置</p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
  @import './SkillsManagement.vue';
</style>
