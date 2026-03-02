<template>
  <div class="app-management">
    <div class="page-header">
      <h1 class="page-title">应用管理</h1>
      <button class="create-btn" @click="handleCreate">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>创建应用</span>
      </button>
    </div>

    <div class="app-grid">
      <div v-for="app in applications" :key="app.id" class="app-card">
        <div class="app-card__icon">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect
              x="14"
              y="14"
              width="7"
              height="7"
              rx="1"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>
        <h3 class="app-card__title">{{ app.name }}</h3>
        <p class="app-card__desc">{{ app.description }}</p>
        <div class="app-card__status">
          <span class="status-dot" :class="`status-dot--${app.status}`"></span>
          <span class="status-text">{{ app.status === 'active' ? '运行中' : '已停止' }}</span>
        </div>
        <div class="app-card__actions">
          <button class="action-btn" @click="handleOrchestrate(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M22 12H18L15 21L9 3L6 12H2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>编排</span>
          </button>
          <button class="action-btn" @click="handleEdit(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>编辑</span>
          </button>
          <button class="action-btn action-btn--danger" @click="handleDelete(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6H5H21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>删除</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import type { Application } from '@/types'

  const router = useRouter()

  const applications = ref<Application[]>([
    {
      id: '1',
      name: '智能客服助手',
      description: '基于大语言模型的智能客服系统，支持多轮对话和知识库检索',
      icon: 'app',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: '2',
      name: '数据分析Agent',
      description: '自动化数据分析工具，支持数据清洗、可视化和报告生成',
      icon: 'app',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: '3',
      name: '文档处理系统',
      description: '智能文档处理，支持PDF、Word等格式的解析和转换',
      icon: 'app',
      status: 'inactive',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ])

  const handleCreate = () => {
    console.log('创建应用')
  }

  const handleOrchestrate = (app: Application) => {
    router.push(`/app/application/orchestration/${app.id}`)
  }

  const handleEdit = (app: Application) => {
    console.log('编辑应用:', app)
  }

  const handleDelete = (app: Application) => {
    console.log('删除应用:', app)
  }
</script>

<style scoped lang="scss">
  .app-management {
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
    background: linear-gradient(135deg, $primary-color, $primary-dark);
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
    }
  }

  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: $spacing-lg;
  }

  .app-card {
    background: $bg-secondary;
    border: 1px solid $bg-elevated;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    transition: all $transition-base ease;

    &:hover {
      transform: translateY(-4px);
      border-color: rgba(0, 212, 255, 0.3);
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(0, 212, 255, 0.2);
    }

    &__icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, $primary-color, $secondary-color);
      border-radius: $border-radius-lg;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $text-primary;
      margin-bottom: $spacing-md;

      svg {
        width: 32px;
        height: 32px;
      }
    }

    &__title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin-bottom: $spacing-sm;
    }

    &__desc {
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: 1.6;
      margin-bottom: $spacing-md;
    }

    &__status {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      margin-bottom: $spacing-md;
    }

    &__actions {
      display: flex;
      gap: $spacing-sm;
      padding-top: $spacing-md;
      border-top: 1px solid $bg-elevated;
    }
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--active {
      background: $success;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    }

    &--inactive {
      background: $text-tertiary;
    }
  }

  .status-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background: $bg-tertiary;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: rgba(0, 212, 255, 0.1);
      color: $primary-color;
    }

    &--danger:hover {
      background: rgba(239, 68, 68, 0.1);
      color: $error;
    }
  }
</style>
