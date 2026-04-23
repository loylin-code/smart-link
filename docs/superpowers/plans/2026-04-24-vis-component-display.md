# VIS 图表组件展示实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在组件管理页面展示 SmartLink vis 包支持的图表组件（line, bar, pie），新增"可视化"分类。

**Architecture:** 在现有组件管理系统基础上扩展，添加 `visual` 分类和 VIS 图表卡片组件。卡片使用 G2 渲染真实图表预览，数据采用 GPT VIS 风格示例。

**Tech Stack:** Vue 3.4 + TypeScript + G2 5.0 + Pinia

---

## 文件结构

```
需要修改的文件：
├── packages/shared/src/constants/component-meta.ts  # 添加 visual 分类 + 图表元数据 + 布局预设
├── app/src/views/resource/ComponentManagement.vue   # 根据分类切换卡片组件
├── app/src/locales/zh-CN.ts                         # 添加 visual 分类 i18n
├── app/src/locales/en-US.ts                         # 添加 visual 分类 i18n (如存在)

需要创建的文件：
├── app/src/components/component/VISComponentCard.vue  # VIS 图表卡片组件
```

---

### Task 1: 添加 visual 分类定义

**Files:**
- Modify: `packages/shared/src/constants/component-meta.ts:1573-1580`

- [ ] **Step 1: 修改 COMPONENT_CATEGORIES 数组**

在 `COMPONENT_CATEGORIES` 数组中，在 `data` 和 `business` 之间添加 `visual` 分类：

```typescript
export const COMPONENT_CATEGORIES = [
  { value: 'all', label: '全部组件' },
  { value: 'basic', label: '基础组件' },
  { value: 'form', label: '表单组件' },
  { value: 'layout', label: '布局组件' },
  { value: 'data', label: '数据组件' },
  { value: 'visual', label: '可视化' },  // 新增：在 data 和 business 之间
  { value: 'business', label: '业务组件' }
] as const
```

- [ ] **Step 2: 验证 TypeScript 类型兼容**

运行构建命令检查类型：
```bash
cd E:/programe/ai/smart-link && pnpm build:lib
```
Expected: 无类型错误

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/component-meta.ts
git commit -m "feat(shared): add visual category to COMPONENT_CATEGORIES"
```

---

### Task 2: 添加图表组件布局预设

**Files:**
- Modify: `packages/shared/src/constants/component-meta.ts:21-187`

- [ ] **Step 1: 在 COMPONENT_LAYOUT_PRESETS 对象末尾添加图表布局预设**

在 `SlDashboardPanel` 预设之后（约第 186 行），添加：

```typescript
  // 可视化组件布局预设
  VisLineChart: {
    width: { preset: '2/3', desktop: 8, tablet: 12, mobile: 12 },
    height: { mode: 'fixed', value: 320, minHeight: 250 }
  },
  VisBarChart: {
    width: { preset: '2/3', desktop: 8, tablet: 12, mobile: 12 },
    height: { mode: 'fixed', value: 320, minHeight: 250 }
  },
  VisPieChart: {
    width: { preset: '1/2', desktop: 6, tablet: 6, mobile: 12 },
    height: { mode: 'fixed', value: 320, minHeight: 250 }
  }
```

- [ ] **Step 2: 验证构建**

```bash
cd E:/programe/ai/smart-link && pnpm build:lib
```
Expected: 无类型错误

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/component-meta.ts
git commit -m "feat(shared): add layout presets for VIS chart components"
```

---

### Task 3: 添加图表组件元数据

**Files:**
- Modify: `packages/shared/src/constants/component-meta.ts:189-1571`

- [ ] **Step 1: 在 COMPONENT_META_LIST 数组末尾添加图表元数据**

在 `SlDashboardPanel` 元数据之后（约第 1570 行），添加 3 个图表组件元数据：

```typescript
  // ============================================
  // 可视化组件 (Visual Components)
  // ============================================
  {
    type: 'VisLineChart',
    name: '折线图',
    category: 'visual',
    description: '展示数据随时间或有序类别的变化趋势',
    icon: 'chart-line',
    props: [
      {
        name: 'data',
        type: 'array',
        description: '图表数据，格式为 [{ category, value }]'
      },
      {
        name: 'xField',
        type: 'string',
        default: 'category',
        description: 'X轴字段名'
      },
      {
        name: 'yField',
        type: 'string',
        default: 'value',
        description: 'Y轴字段名'
      },
      {
        name: 'smooth',
        type: 'boolean',
        default: false,
        description: '是否平滑曲线'
      },
      {
        name: 'title',
        type: 'string',
        description: '图表标题'
      }
    ],
    events: [],
    slots: [],
    examples: [
      {
        title: '温度变化趋势',
        description: '展示全球平均温度距平变化',
        code: `<VisLineChart
  :data="[
    { year: '1880', value: -0.12 },
    { year: '1900', value: -0.08 },
    { year: '1920', value: -0.25 },
    { year: '1940', value: 0.12 },
    { year: '1960', value: 0.03 },
    { year: '1980', value: 0.26 },
    { year: '2000', value: 0.42 },
    { year: '2020', value: 1.02 }
  ]"
  xField="year"
  yField="value"
  smooth
/>`
      }
    ]
  },
  {
    type: 'VisBarChart',
    name: '柱状图',
    category: 'visual',
    description: '用于不同类别之间的数据对比展示',
    icon: 'chart-bar',
    props: [
      {
        name: 'data',
        type: 'array',
        description: '图表数据，格式为 [{ category, value }]'
      },
      {
        name: 'xField',
        type: 'string',
        default: 'category',
        description: 'X轴字段名'
      },
      {
        name: 'yField',
        type: 'string',
        default: 'value',
        description: 'Y轴字段名'
      },
      {
        name: 'stack',
        type: 'boolean',
        default: false,
        description: '是否堆叠'
      },
      {
        name: 'title',
        type: 'string',
        description: '图表标题'
      }
    ],
    events: [],
    slots: [],
    examples: [
      {
        title: '季度销售额对比',
        description: '展示各季度销售额对比',
        code: `<VisBarChart
  :data="[
    { quarter: 'Q1', sales: 12500 },
    { quarter: 'Q2', sales: 18200 },
    { quarter: 'Q3', sales: 15600 },
    { quarter: 'Q4', sales: 22800 }
  ]"
  xField="quarter"
  yField="sales"
/>`
      }
    ]
  },
  {
    type: 'VisPieChart',
    name: '饼图',
    category: 'visual',
    description: '展示各部分在整体中的占比分布',
    icon: 'chart-pie',
    props: [
      {
        name: 'data',
        type: 'array',
        description: '图表数据，格式为 [{ name, value }]'
      },
      {
        name: 'valueField',
        type: 'string',
        default: 'value',
        description: '值字段名'
      },
      {
        name: 'categoryField',
        type: 'string',
        default: 'name',
        description: '分类字段名'
      },
      {
        name: 'innerRadius',
        type: 'number',
        default: 0,
        description: '内半径（0-1），大于0为环形图'
      },
      {
        name: 'title',
        type: 'string',
        description: '图表标题'
      }
    ],
    events: [],
    slots: [],
    examples: [
      {
        title: '市场份额分布',
        description: '展示各产品市场份额占比',
        code: `<VisPieChart
  :data="[
    { name: '产品A', value: 35 },
    { name: '产品B', value: 25 },
    { name: '产品C', value: 20 },
    { name: '其他', value: 20 }
  ]"
  :innerRadius="0.4"
/>`
      }
    ]
  }
```

- [ ] **Step 2: 验证构建**

```bash
cd E:/programe/ai/smart-link && pnpm build:lib
```
Expected: 无类型错误

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/constants/component-meta.ts
git commit -m "feat(shared): add VIS chart component metadata (line, bar, pie)"
```

---

### Task 4: 创建 VISComponentCard 组件

**Files:**
- Create: `app/src/components/component/VISComponentCard.vue`

- [ ] **Step 1: 创建 VISComponentCard.vue 文件**

```vue
<template>
  <div class="vis-component-card" @click="$emit('click')">
    <div class="preview-area" ref="chartContainerRef"></div>
    <div class="card-info">
      <span class="card-name">{{ component.name }}</span>
      <span class="card-category">{{ categoryLabel }}</span>
    </div>
    <div class="card-desc">{{ component.description }}</div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import type { ComponentMeta } from '@smart-link/shared'
  import { COMPONENT_CATEGORIES } from '@smart-link/shared'
  import { LineChart, BarChart, PieChart } from '@smart-link/vis'
  import type { ChartInstance, ChartOptions } from '@smart-link/vis'

  const props = defineProps<{
    component: ComponentMeta
  }>()

  defineEmits<{
    click: []
  }>()

  const chartContainerRef = ref<HTMLElement | null>(null)
  let chartInstance: ChartInstance | null = null

  const categoryLabel = computed(() => {
    const cat = COMPONENT_CATEGORIES.find((c) => c.value === props.component.category)
    return cat?.label || props.component.category
  })

  // GPT VIS 风格预览数据
  const PREVIEW_DATA = {
    VisLineChart: {
      data: [
        { year: '1880', value: -0.12 },
        { year: '1900', value: -0.08 },
        { year: '1920', value: -0.25 },
        { year: '1940', value: 0.12 },
        { year: '1960', value: 0.03 },
        { year: '1980', value: 0.26 },
        { year: '2000', value: 0.42 },
        { year: '2020', value: 1.02 }
      ],
      xField: 'year',
      yField: 'value',
      smooth: true
    },
    VisBarChart: {
      data: [
        { quarter: 'Q1', sales: 12500 },
        { quarter: 'Q2', sales: 18200 },
        { quarter: 'Q3', sales: 15600 },
        { quarter: 'Q4', sales: 22800 }
      ],
      xField: 'quarter',
      yField: 'sales'
    },
    VisPieChart: {
      data: [
        { name: '产品A', value: 35 },
        { name: '产品B', value: 25 },
        { name: '产品C', value: 20 },
        { name: '其他', value: 20 }
      ],
      valueField: 'value',
      categoryField: 'name',
      innerRadius: 0.4
    }
  }

  // 图表工厂映射
  const CHART_FACTORY_MAP: Record<string, (options: ChartOptions) => ChartInstance> = {
    VisLineChart: LineChart,
    VisBarChart: BarChart,
    VisPieChart: PieChart
  }

  const renderChart = () => {
    if (!chartContainerRef.value) return

    const chartType = props.component.type
    const factory = CHART_FACTORY_MAP[chartType]
    if (!factory) return

    // 销毁现有图表
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }

    // 创建图表实例
    const options: ChartOptions = {
      container: chartContainerRef.value,
      width: chartContainerRef.value.clientWidth || 280,
      height: 120,
      theme: 'light'
    }

    chartInstance = factory(options)

    // 获取预览数据
    const previewConfig = PREVIEW_DATA[chartType as keyof typeof PREVIEW_DATA]
    if (previewConfig) {
      chartInstance.render(previewConfig)
    }
  }

  onMounted(() => {
    renderChart()
  })

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
  })

  // 监听组件变化重新渲染
  watch(() => props.component.type, () => {
    renderChart()
  })
</script>

<style scoped lang="scss">
  .vis-component-card {
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    cursor: pointer;
    transition: all $transition-base ease;
    overflow: hidden;
    box-shadow: $shadow-card;

    &:hover {
      border-color: rgba(16, 185, 129, 0.5);
      transform: translateY(-4px);
      box-shadow: $shadow-card-hover;

      .preview-area {
        background: $bg-tertiary;
      }
    }
  }

  .preview-area {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-tertiary;
    transition: background $transition-base ease;
  }

  .card-info {
    padding: $spacing-md $spacing-lg;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid $border-color-light;
  }

  .card-name {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .card-category {
    font-size: $font-size-xs;
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    padding: 2px 8px;
    border-radius: $border-radius-sm;
  }

  .card-desc {
    padding: $spacing-sm $spacing-lg $spacing-md;
    font-size: $font-size-sm;
    color: $text-tertiary;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
```

- [ ] **Step 2: 验证组件导入路径**

检查 `@smart-link/vis` 包是否正确导出 `LineChart`, `BarChart`, `PieChart`：

```bash
cd E:/programe/ai/smart-link/packages/vis && cat src/charts/index.ts
```
Expected: 看到 `export { LineChart, BarChart, PieChart } from './line'` 等导出

- [ ] **Step 3: 验证构建**

```bash
cd E:/programe/ai/smart-link && pnpm dev
```
Expected: 应用启动无错误，访问 `/app/resource/components` 页面检查组件加载

- [ ] **Step 4: Commit**

```bash
git add app/src/components/component/VISComponentCard.vue
git commit -m "feat(app): create VISComponentCard for chart preview display"
```

---

### Task 5: 修改组件管理页面切换卡片组件

**Files:**
- Modify: `app/src/views/resource/ComponentManagement.vue:59-65`

- [ ] **Step 1: 导入 VISComponentCard 组件**

在 `<script setup>` 中添加导入（约第 85 行之后）：

```typescript
  import ComponentCard from '@/components/component/ComponentCard.vue'
  import VISComponentCard from '@/components/component/VISComponentCard.vue'  // 新增
```

- [ ] **Step 2: 修改卡片渲染逻辑**

修改模板中的卡片渲染部分（约第 58-65 行），根据分类切换组件：

```vue
    <div v-if="filteredComponents.length" class="component-grid">
      <template v-for="component in filteredComponents" :key="component.type">
        <VISComponentCard
          v-if="component.category === 'visual'"
          :component="component"
          @click="openDetail(component)"
        />
        <ComponentCard
          v-else
          :component="component"
          @click="openDetail(component)"
        />
      </template>
    </div>
```

- [ ] **Step 3: 验证页面显示**

```bash
cd E:/programe/ai/smart-link && pnpm dev
```

访问 `http://localhost:5173/app/resource/components`，点击"可视化"分类标签，Expected: 显示 3 个图表卡片，每个卡片正确渲染 G2 图表

- [ ] **Step 4: Commit**

```bash
git add app/src/views/resource/ComponentManagement.vue
git commit -m "feat(app): switch card component based on category in ComponentManagement"
```

---

### Task 6: 添加国际化支持

**Files:**
- Modify: `app/src/locales/zh-CN.ts:341-349`

- [ ] **Step 1: 在 zh-CN.ts 的 component.categories 中添加 visual**

找到 `component.categories` 对象（约第 341-349 行），在 `data` 之后添加：

```typescript
    categories: {
      all: '全部组件',
      basic: '基础组件',
      form: '表单组件',
      layout: '布局组件',
      data: '数据展示',
      visual: '可视化',  // 新增
      feedback: '反馈组件',
      business: '业务组件'
    },
```

- [ ] **Step 2: 检查 en-US.ts 是否存在并添加对应翻译**

如果存在 `app/src/locales/en-US.ts`，添加：

```typescript
    categories: {
      all: 'All Components',
      basic: 'Basic',
      form: 'Form',
      layout: 'Layout',
      data: 'Data',
      visual: 'Visual',  // 新增
      feedback: 'Feedback',
      business: 'Business'
    },
```

- [ ] **Step 3: 验证国际化显示**

```bash
cd E:/programe/ai/smart-link && pnpm dev
```

切换语言，检查分类标签显示正确的翻译文本。

- [ ] **Step 4: Commit**

```bash
git add app/src/locales/zh-CN.ts app/src/locales/en-US.ts
git commit -m "feat(i18n): add visual category translations"
```

---

### Task 7: 最终验证和集成提交

**Files:**
- All modified files

- [ ] **Step 1: 运行完整构建**

```bash
cd E:/programe/ai/smart-link && pnpm build
```
Expected: 构建成功，无 TypeScript 错误

- [ ] **Step 2: 运行 lint 检查**

```bash
cd E:/programe/ai/smart-link && pnpm lint
```
Expected: 无 lint 错误（如有可忽略的警告，注明）

- [ ] **Step 3: 手动功能验证**

1. 启动开发服务器：`pnpm dev`
2. 访问组件管理页面：`http://localhost:5173/app/resource/components`
3. 检查分类标签栏显示"可视化"（在数据组件和业务组件之间）
4. 点击"可视化"分类，检查显示 3 个图表卡片
5. 检查每个卡片：
   - 折线图：显示温度变化趋势折线
   - 柱状图：显示季度销售额柱状图
   - 饼图：显示市场份额环形图
6. 检查卡片 hover 效果和样式正确

- [ ] **Step 4: 推送到远程仓库**

```bash
cd E:/programe/ai/smart-link && git push origin main
```
Expected: 推送成功

---

## 验收标准

- [x] 组件管理页面显示"可视化"分类标签
- [x] 点击"可视化"分类，显示 3 个图表卡片
- [x] 每个卡片正确渲染对应的 G2 图表预览
- [x] 卡片布局符合设计（大预览图 120px）
- [x] 分类标签位置正确（数据 → 可视化 → 业务）
- [x] 国际化支持中英文显示
- [x] TypeScript 类型检查通过
- [x] 构建无错误