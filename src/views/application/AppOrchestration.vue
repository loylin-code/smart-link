<template>
  <div class="app-orchestration">
    <div class="orchestration-header">
      <h1 class="page-title">应用编排</h1>
      <div class="header-actions">
        <button class="action-btn">保存</button>
        <button class="action-btn action-btn--primary">运行</button>
      </div>
    </div>

    <div class="orchestration-content">
      <div class="component-library">
        <h3 class="library-title">组件库</h3>
        <div class="component-list">
          <div class="component-item">
            <div class="component-icon">🤖</div>
            <span class="component-name">Agent</span>
          </div>
          <div class="component-item">
            <div class="component-icon">⚡</div>
            <span class="component-name">Skill</span>
          </div>
          <div class="component-item">
            <div class="component-icon">🔧</div>
            <span class="component-name">Tool</span>
          </div>
          <div class="component-item">
            <div class="component-icon">📥</div>
            <span class="component-name">Input</span>
          </div>
          <div class="component-item">
            <div class="component-icon">📤</div>
            <span class="component-name">Output</span>
          </div>
        </div>
      </div>

      <div class="canvas-area">
        <div class="canvas-placeholder">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>拖拽组件到此处开始编排</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.app-orchestration {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $bg-primary;
}

.orchestration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg $spacing-xl;
  border-bottom: 1px solid $bg-elevated;
}

.page-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.header-actions {
  display: flex;
  gap: $spacing-sm;
}

.action-btn {
  padding: $spacing-sm $spacing-lg;
  background: $bg-tertiary;
  border: 1px solid $bg-elevated;
  border-radius: $border-radius-md;
  color: $text-primary;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: all $transition-base ease;

  &:hover {
    background: $bg-elevated;
  }

  &--primary {
    background: linear-gradient(135deg, $primary-color, $primary-dark);
    border: none;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
    }
  }
}

.orchestration-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.component-library {
  width: 240px;
  background: $bg-secondary;
  border-right: 1px solid $bg-elevated;
  padding: $spacing-md;
}

.library-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.component-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: $bg-tertiary;
  border: 1px solid $bg-elevated;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-base ease;

  &:hover {
    border-color: $primary-color;
    background: rgba(0, 212, 255, 0.1);
  }
}

.component-icon {
  font-size: $font-size-lg;
}

.component-name {
  font-size: $font-size-sm;
  color: $text-primary;
}

.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-primary;
}

.canvas-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  color: $text-tertiary;

  svg {
    width: 80px;
    height: 80px;
  }

  p {
    font-size: $font-size-base;
  }
}
</style>
