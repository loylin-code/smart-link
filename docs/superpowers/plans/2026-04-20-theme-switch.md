# 主题切换功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 smart-link 添加亮白/暗黑主题切换功能，包含 Header 快捷切换按钮、过渡动画和图标动态切换。

**Architecture:** 沿用现有 Pinia Store (`settings.ts`) 管理主题状态，通过 `data-theme` 属性切换 CSS 变量，localStorage 自动持久化。在 Header 添加切换按钮，添加全局过渡动画。

**Tech Stack:** Vue 3.4 + Pinia + CSS Custom Properties + SCSS + vue-i18n

---

## 文件结构

| 序号 | 文件 | 改动类型 | 说明 |
|------|------|----------|------|
| 1 | `app/src/types/index.ts` | 修改 | 简化 AppearanceSettings.theme 类型 |
| 2 | `app/src/store/modules/settings.ts` | 修改 | 简化 currentTheme getter，添加 toggleTheme() |
| 3 | `app/src/store/modules/app.ts` | 修改 | 移除冗余 theme 状态 |
| 4 | `app/src/locales/zh-CN.ts` | 修改 | 添加切换文案 |
| 5 | `app/src/locales/en-US.ts` | 修改 | 添加切换文案 |
| 6 | `app/src/assets/styles/global.scss` | 修改 | 添加过渡动画样式 |
| 7 | `app/src/components/layout/AppLayout.vue` | 修改 | 初始化时调用 applyTheme() |
| 8 | `app/src/components/layout/AppHeader.vue` | 修改 | 添加主题切换按钮 |
| 9 | `app/src/views/settings/AppearanceSettings.vue` | 修改 | 移除 system 选项，简化为二选一 |

---

## Task 1: 修改类型定义

**Files:**
- Modify: `app/src/types/index.ts:787-792`

- [ ] **Step 1: 修改 AppearanceSettings 接口的 theme 类型**

将 `theme: 'light' | 'dark' | 'system'` 改为 `theme: 'light' | 'dark'`

```typescript
// 文件: app/src/types/index.ts
// 位置: 第 787-792 行

export interface AppearanceSettings {
  theme: 'light' | 'dark'  // 移除 'system'
  primaryColor: string
  language: 'zh-CN' | 'en-US'
  fontSize: 'small' | 'medium' | 'large'
}
```

---

## Task 2: 修改 settings.ts Store

**Files:**
- Modify: `app/src/store/modules/settings.ts:59-69` (currentTheme getter)
- Modify: `app/src/store/modules/settings.ts:80-103` (actions)

- [ ] **Step 1: 简化 currentTheme getter**

移除 system 相关判断逻辑，直接返回 `state.appearance.theme`

```typescript
// 文件: app/src/store/modules/settings.ts
// 位置: getters 部分

getters: {
  currentTheme(state): 'light' | 'dark' {
    return state.appearance.theme
  },
  // ... 其他 getters 保持不变
}
```

- [ ] **Step 2: 添加 toggleTheme() 方法**

在 actions 中添加 toggleTheme 方法

```typescript
// 文件: app/src/store/modules/settings.ts
// 位置: actions 部分，在 setTheme 方法之后添加

toggleTheme() {
  this.appearance.theme = this.appearance.theme === 'light' ? 'dark' : 'light'
  this.applyTheme()
},
```

- [ ] **Step 3: 修改 applyTheme() 方法**

添加过渡动画类

```typescript
// 文件: app/src/store/modules/settings.ts
// 位置: actions 部分，替换现有的 applyTheme 方法

applyTheme() {
  if (typeof document !== 'undefined') {
    const theme = this.currentTheme
    // 添加过渡类触发动画
    document.documentElement.classList.add('theme-transition')
    document.documentElement.setAttribute('data-theme', theme)
    // 300ms 后移除过渡类
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 300)
  }
},
```

---

## Task 3: 移除 app.ts 冗余 theme 状态

**Files:**
- Modify: `app/src/store/modules/app.ts:12` (state)
- Modify: `app/src/store/modules/app.ts:25` (state default)
- Modify: `app/src/store/modules/app.ts:60-62` (setTheme action)
- Modify: `app/src/store/modules/app.ts:67` (persist paths)

- [ ] **Step 1: 移除 AppState 中的 theme 字段**

```typescript
// 文件: app/src/store/modules/app.ts
// 位置: AppState 接口定义

interface AppState {
  sidebar: {
    collapsed: boolean
  }
  console: {
    visible: boolean
    height: number
    activeTab: string
  }
  // theme: 'dark' | 'light'  ← 删除此行
}
```

- [ ] **Step 2: 移除 state 默认值中的 theme**

```typescript
// 文件: app/src/store/modules/app.ts
// 位置: state 函数

state: (): AppState => ({
  sidebar: {
    collapsed: false
  },
  console: {
    visible: true,
    height: 200,
    activeTab: 'console'
  },
  // theme: 'dark'  ← 删除此行
}),
```

- [ ] **Step 3: 移除 setTheme 方法**

删除 actions 中的 setTheme 方法（第 60-62 行）

```typescript
// 删除以下代码：
// setTheme(theme: 'dark' | 'light') {
//   this.theme = theme
// }
```

- [ ] **Step 4: 更新 persist.paths**

移除 'theme' 路径

```typescript
// 文件: app/src/store/modules/app.ts
// 位置: persist 配置

persist: {
  key: 'smart-link-app',
  paths: ['sidebar.collapsed', 'console.visible', 'console.height']
  // 移除 'theme'
}
```

---

## Task 4: 添加中文国际化文案

**Files:**
- Modify: `app/src/locales/zh-CN.ts:common` 部分

- [ ] **Step 1: 在 common 对象中添加切换文案**

在 `common` 对象的 `items: '条'` 之后添加：

```typescript
// 文件: app/src/locales/zh-CN.ts
// 位置: common 对象，在 items: '条' 之后添加

common: {
  // ... 现有内容 ...
  items: '条',
  // 新增以下两行
  switchToLight: '切换到亮色模式',
  switchToDark: '切换到暗色模式',
},
```

---

## Task 5: 添加英文国际化文案

**Files:**
- Modify: `app/src/locales/en-US.ts:common` 部分

- [ ] **Step 1: 在 common 对象中添加切换文案**

在 `common` 对象的 `thisMonth: 'This Month'` 之后添加：

```typescript
// 文件: app/src/locales/en-US.ts
// 位置: common 对象，在 thisMonth 之后添加

common: {
  // ... 现有内容 ...
  thisMonth: 'This Month',
  // 新增以下两行
  switchToLight: 'Switch to light mode',
  switchToDark: 'Switch to dark mode',
},
```

---

## Task 6: 添加全局过渡动画样式

**Files:**
- Modify: `app/src/assets/styles/global.scss` (文件末尾添加)

- [ ] **Step 1: 添加主题切换过渡动画**

在文件末尾添加以下样式：

```scss
// 文件: app/src/assets/styles/global.scss
// 位置: 文件末尾添加

// ================================
// 主题切换过渡动画
// ================================
.theme-transition,
.theme-transition *,
.theme-transition *::before,
.theme-transition *::after {
  transition: 
    background-color 300ms $ease-out,
    color 300ms $ease-out,
    border-color 300ms $ease-out,
    box-shadow 300ms $ease-out,
    fill 300ms $ease-out,
    stroke 300ms $ease-out !important;
}

// 减少动画模式兼容（无障碍支持）
@media (prefers-reduced-motion: reduce) {
  .theme-transition,
  .theme-transition *,
  .theme-transition *::before,
  .theme-transition *::after {
    transition: none !important;
  }
}
```

---

## Task 7: 在 AppLayout 中初始化主题

**Files:**
- Modify: `app/src/components/layout/AppLayout.vue:17-20` (script setup)

- [ ] **Step 1: 导入 useSettingsStore 并添加初始化逻辑**

```vue
<script setup lang="ts">
  import { onMounted } from 'vue'
  import AppHeader from './AppHeader.vue'
  import AppSidebar from './AppSidebar.vue'
  import { useSettingsStore } from '@/store/modules/settings'

  const settingsStore = useSettingsStore()

  // 初始化主题
  onMounted(() => {
    settingsStore.applyTheme()
  })
</script>
```

---

## Task 8: 在 AppHeader 中添加主题切换按钮

**Files:**
- Modify: `app/src/components/layout/AppHeader.vue:56-72` (template)
- Modify: `app/src/components/layout/AppHeader.vue:76-86` (script)
- Modify: `app/src/components/layout/AppHeader.vue:88-217` (style)

- [ ] **Step 1: 在 template 中添加切换按钮**

在 `app-header__right` 区域的 `<LanguageSwitcher />` 之前添加：

```vue
<template>
  <!-- 在 app-header__right 区域 -->
  <div class="app-header__right">
    <!-- 新增主题切换按钮 -->
    <button 
      class="theme-toggle-btn" 
      :title="isDark ? t('common.switchToLight') : t('common.switchToDark')"
      @click="handleToggleTheme"
    >
      <svg class="theme-icon" viewBox="0 0 24 24" fill="none">
        <!-- 太阳图标 - 亮色模式时显示 -->
        <template v-if="!isDark">
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </template>
        <!-- 月亮图标 - 暗色模式时显示 -->
        <template v-else>
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.97-4.03-9-9-9z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.1"/>
        </template>
      </svg>
    </button>
    <LanguageSwitcher />
    <!-- ... 其他内容 -->
  </div>
</template>
```

- [ ] **Step 2: 修改 script setup**

```vue
<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useSettingsStore } from '@/store/modules/settings'
  import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

  const route = useRoute()
  const { t } = useI18n()
  const settingsStore = useSettingsStore()

  const currentTitle = computed(() => {
    return route.meta.title || 'SmartLink'
  })

  const isDark = computed(() => settingsStore.appearance.theme === 'dark')

  const handleToggleTheme = () => {
    settingsStore.toggleTheme()
  }
</script>
```

- [ ] **Step 3: 添加按钮样式**

在 `<style scoped lang="scss">` 中，`.user-info` 样式之前添加：

```scss
// 主题切换按钮样式
.theme-toggle-btn {
  width: 36px;
  height: 36px;
  border-radius: $border-radius-md;
  background: transparent;
  border: 1px solid $border-color-base;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast $ease-out;

  &:hover {
    background: $bg-secondary;
    border-color: $primary-color;
  }

  .theme-icon {
    width: 20px;
    height: 20px;
    color: $text-secondary;
    transition: color $transition-fast $ease-out, transform $transition-base $ease-out;
  }

  &:hover .theme-icon {
    color: $primary-color;
    transform: rotate(15deg);
  }
}
```

---

## Task 9: 简化 AppearanceSettings.vue

**Files:**
- Modify: `app/src/views/settings/AppearanceSettings.vue:13-86` (template)
- Modify: `app/src/views/settings/AppearanceSettings.vue:352-360` (style)

- [ ] **Step 1: 移除 system 选项卡片**

删除第 65-85 行的 system 选项按钮：

```vue
<!-- 删除以下代码块（第 65-85 行） -->
<button
  class="theme-card"
  :class="{ 'theme-card--active': localAppearance.theme === 'system' }"
  @click="localAppearance.theme = 'system'"
>
  <div class="theme-card__preview theme-card__preview--system">
    <div class="preview-system"></div>
  </div>
  <span class="theme-card__label">{{ t('settings.followSystem') }}</span>
  <span v-if="localAppearance.theme === 'system'" class="theme-card__check">
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5 12L10 17L19 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </span>
</button>
```

- [ ] **Step 2: 简化 theme-badge 显示逻辑**

修改第 14-19 行的 badge 显示：

```vue
<span class="section-badge">{{
  localAppearance.theme === 'light'
    ? t('settings.lightMode')
    : t('settings.darkMode')
}}</span>
```

- [ ] **Step 3: 修改 grid 为 2 列**

修改第 352-360 行的样式：

```scss
.theme-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  // 从 3 改为 2
  gap: $spacing-md;

  @include respond-below(md) {
    grid-template-columns: 1fr;
  }
}
```

---

## Task 10: 验证与测试

- [ ] **Step 1: 运行开发服务器验证**

Run: `pnpm dev`

Expected: 应用正常启动

- [ ] **Step 2: 功能测试清单**

手动测试以下功能：

1. Header 切换按钮点击 → 主题切换成功
2. 图标正确显示（亮色=太阳，暗色=月亮）
3. 页面刷新后主题保持
4. 设置页面选择主题后保存生效
5. 过渡动画流畅（300ms）
6. hover 时图标旋转动画正常

- [ ] **Step 3: 提交代码**

```bash
git add app/src/types/index.ts
git add app/src/store/modules/settings.ts
git add app/src/store/modules/app.ts
git add app/src/locales/zh-CN.ts
git add app/src/locales/en-US.ts
git add app/src/assets/styles/global.scss
git add app/src/components/layout/AppLayout.vue
git add app/src/components/layout/AppHeader.vue
git add app/src/views/settings/AppearanceSettings.vue
git commit -m "feat(theme): add theme switching with light/dark modes

- Add theme toggle button in AppHeader with sun/moon icons
- Add smooth transition animation (300ms)
- Simplify theme type to light/dark (remove system option)
- Remove redundant theme state in app.ts store
- Add i18n labels for theme switching
- Initialize theme on AppLayout mount"
```

---

## Self-Review Checklist

| 检查项 | 状态 |
|--------|------|
| Spec coverage | ✅ 所有设计要求已覆盖 |
| Placeholder scan | ✅ 无 TBD/TODO，所有代码完整 |
| Type consistency | ✅ types/index.ts 与 store 中的类型一致 |
| i18n keys | ✅ zh-CN.ts 和 en-US.ts 使用相同的 key 名称 |
| CSS variables | ✅ 使用现有 variables.scss 中的变量 |
| Animation timing | ✅ 过渡动画 300ms，与设计一致 |