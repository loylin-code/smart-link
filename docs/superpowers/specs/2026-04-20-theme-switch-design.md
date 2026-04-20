# 主题切换功能设计文档

**日期**: 2026-04-20
**状态**: 已批准
**参考项目**: cdb-web (E:\programe\ai\cdb-web)

---

## 一、需求概述

为 smart-link 添加主题切换功能，支持亮白（light）和暗黑（dark）两种主题模式。

### 用户决策

| 决策项 | 选择 |
|--------|------|
| 主题模式 | 仅 light/dark 两种 |
| 切换入口 | Header 快捷切换按钮 |
| 实现方式 | 沿用现有 Pinia Store 方案 |
| 增强功能 | 添加过渡动画 + 图标动态切换 + Tooltip 提示 |

---

## 二、现有架构分析

### 已有基础设施（可直接复用）

1. **CSS 变量系统** (`packages/theme/src/styles/variables.scss`)
   - `:root` 定义浅色模式变量
   - `[data-theme='dark']` 定义暗黑模式变量
   - 完整的颜色、阴影、边框、渐变变量

2. **主题定义** (`packages/theme/src/themes/index.ts`)
   - `darkTheme` 和 `lightTheme` 对象
   - `ThemeColors` 接口（19 种颜色变量）

3. **Store 状态** (`app/src/store/modules/settings.ts`)
   - `appearance.theme` 状态
   - `setTheme()` 和 `applyTheme()` 方法
   - `persist` 配置（localStorage 自动持久化）

4. **设置页面 UI** (`app/src/views/settings/AppearanceSettings.vue`)
   - 主题选择卡片（目前支持 light/dark/system）

### 需要修改的部分

1. 简化 theme 类型：移除 `system` 选项
2. 移除 `app.ts` 中冗余的 theme 状态
3. 添加 Header 切换按钮
4. 添加过渡动画样式
5. 添加 toggleTheme() 方法

---

## 三、架构设计

```
┌───────────────────────────────────────────────────────────────────────┐
│                     主题切换系统架构                                    │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐        ┌─────────────────┐                      │
│  │ AppHeader.vue   │        │ settings.ts     │                      │
│  │ [切换按钮]      │───────▶│ Pinia Store     │                      │
│  │ 太阳/月亮图标   │        │ theme: light/dark│                      │
│  └─────────────────┘        └─────────────────┘                      │
│                                    │                                  │
│                                    │ applyTheme()                     │
│                                    ▼                                  │
│                           ┌─────────────────┐                        │
│                           │ DOM             │                        │
│                           │ data-theme attr │                        │
│                           └─────────────────┘                        │
│                                    │                                  │
│                                    ▼                                  │
│                           ┌─────────────────┐                        │
│                           │ CSS Variables   │                        │
│                           │ 自动切换颜色    │                        │
│                           └─────────────────┘                        │
│                                                                       │
│  ┌─────────────────┐        ┌─────────────────┐                      │
│  │ localStorage    │◀───────│ persist 插件    │                      │
│  │ 持久化存储      │        │ 自动同步        │                      │
│  └─────────────────┘        └─────────────────┘                      │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 四、改动清单

| 序号 | 文件 | 改动类型 | 说明 |
|------|------|----------|------|
| 1 | `app/src/store/modules/settings.ts` | 修改 | 简化类型，添加 toggleTheme() |
| 2 | `app/src/store/modules/app.ts` | 修改 | 移除冗余 theme 状态 |
| 3 | `app/src/types/index.ts` | 修改 | AppearanceSettings.theme 改为 `'light'|'dark'` |
| 4 | `app/src/components/layout/AppHeader.vue` | 修改 | 添加主题切换按钮 |
| 5 | `app/src/components/layout/AppLayout.vue` | 修改 | 初始化时调用 applyTheme() |
| 6 | `app/src/views/settings/AppearanceSettings.vue` | 修改 | 移除 system 选项 |
| 7 | `app/src/assets/styles/global.scss` | 修改 | 添加过渡动画样式 |
| 8 | `app/src/locales/zh-CN.ts` | 修改 | 添加切换文案 |
| 9 | `app/src/locales/en-US.ts` | 修改 | 添加切换文案 |

---

## 五、详细实现

### 5.1 Store 改动 (`settings.ts`)

**文件**: `app/src/store/modules/settings.ts`

**改动内容**:

1. 简化 `currentTheme` getter（移除 system 判断逻辑）

```typescript
getters: {
  currentTheme(state): 'light' | 'dark' {
    return state.appearance.theme
  },
  // ...
}
```

2. 新增 `toggleTheme()` 方法

```typescript
actions: {
  toggleTheme() {
    this.appearance.theme = this.appearance.theme === 'light' ? 'dark' : 'light'
    this.applyTheme()
  },

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
  // ...
}
```

### 5.2 移除冗余状态 (`app.ts`)

**文件**: `app/src/store/modules/app.ts`

**改动内容**:

1. 移除 `theme` 状态字段

```typescript
interface AppState {
  sidebar: { collapsed: boolean }
  console: { visible: boolean; height: number; activeTab: string }
  // theme: 'dark' | 'light'  ← 删除
}
```

2. 移除 `setTheme()` 方法

3. 更新 `persist.paths`（移除 `theme`）

```typescript
persist: {
  key: 'smart-link-app',
  paths: ['sidebar.collapsed', 'console.visible', 'console.height']
}
```

### 5.3 类型定义改动 (`types/index.ts`)

**文件**: `app/src/types/index.ts`

**改动内容**:

```typescript
export interface AppearanceSettings {
  theme: 'light' | 'dark'  // 移除 'system'
  primaryColor: string
  language: 'zh-CN' | 'en-US'
  fontSize: 'small' | 'medium' | 'large'
}
```

### 5.4 Header 切换按钮 (`AppHeader.vue`)

**文件**: `app/src/components/layout/AppHeader.vue`

**位置**: 在 `app-header__right` 区域，`LanguageSwitcher` 组件之前

**实现要点**:

1. 导入 `useSettingsStore`
2. 计算 `isDark` 属性
3. 动态切换图标（亮色显示太阳，暗色显示月亮）
4. hover 时图标旋转动画
5. Tooltip 提示当前可切换的目标模式

**图标设计**:
- 亮色模式：太阳图标（圆形 + 8 条射线）
- 暗色模式：月亮图标（新月形状）

### 5.5 设置页面简化 (`AppearanceSettings.vue`)

**文件**: `app/src/views/settings/AppearanceSettings.vue`

**改动内容**:

1. 移除 system 选项卡片
2. 调整 grid 为 2 列（而非 3 列）
3. 移除 `followSystem` 相关文案判断

```vue
<div class="theme-cards">
  <!-- 仅保留 light 和 dark 两个按钮 -->
  <button class="theme-card" ...>
    <!-- light -->
  </button>
  <button class="theme-card" ...>
    <!-- dark -->
  </button>
  <!-- 移除 system -->
</div>
```

### 5.6 全局过渡动画 (`global.scss`)

**文件**: `app/src/assets/styles/global.scss`

**添加内容**:

```scss
// 主题切换过渡动画
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

### 5.7 初始化时机 (`AppLayout.vue`)

**文件**: `app/src/components/layout/AppLayout.vue`

**改动内容**:

在 `onMounted` 中调用 `applyTheme()`，确保页面加载时主题正确应用。

```typescript
import { onMounted } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.applyTheme()
})
```

### 5.8 国际化文案

**文件**: `app/src/locales/zh-CN.ts`

```typescript
common: {
  // 新增
  switchToLight: '切换到亮色模式',
  switchToDark: '切换到暗色模式',
  // ...
}
```

**文件**: `app/src/locales/en-US.ts`

```typescript
common: {
  // 新增
  switchToLight: 'Switch to light mode',
  switchToDark: 'Switch to dark mode',
  // ...
}
```

---

## 六、数据流

```
用户点击 Header 切换按钮
        │
        ▼
settingsStore.toggleTheme()
        │
        ▼
appearance.theme ← 'light' ⇄ 'dark'
        │
        ├──────────────────▶ localStorage 持久化 (自动)
        │
        ▼
applyTheme()
        │
        ├─▶ document.documentElement.classList.add('theme-transition')
        │
        ├─▶ document.documentElement.setAttribute('data-theme', theme)
        │
        └─▶ setTimeout(() => removeClass('theme-transition'), 300)
        │
        ▼
CSS 变量自动切换
(:root ⇄ [data-theme='dark'])
        │
        ▼
所有组件样式自动更新
```

---

## 七、测试要点

1. **功能测试**
   - 点击 Header 切换按钮，主题正确切换
   - 页面刷新后主题保持（localStorage 持久化）
   - 设置页面选择主题，点击保存后生效

2. **视觉测试**
   - 所有颜色变量正确切换
   - 过渡动画流畅（300ms）
   - 图标正确显示（太阳/月亮）
   - hover 动画效果正常

3. **无障碍测试**
   - `prefers-reduced-motion` 时禁用过渡动画
   - 按钮有正确的 `title` 属性
   - 键盘可操作

---

## 八、风险与限制

1. **已有组件硬编码颜色**: 部分组件可能使用了硬编码颜色值而非 CSS 变量，需要后续排查替换

2. **第三方组件**: OpenTiny 组件库（`@opentiny/vue-theme`）可能不完全支持暗黑模式，需要额外适配

3. **性能**: 全局过渡动画可能在高复杂度页面有轻微性能影响，已通过 300ms 短动画和 reduce-motion 支持缓解

---

## 九、后续优化建议

1. 监听系统偏好变化（如未来需要支持 system 模式）
2. 添加更多主题色选项（蓝、紫、绿等）
3. 为 OpenTiny 组件库定制暗黑主题 CSS
4. 添加主题切换快捷键（如 Ctrl+Shift+T）