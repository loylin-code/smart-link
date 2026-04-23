# VIS 图表组件展示设计文档

**日期**: 2026-04-24
**状态**: 已批准
**作者**: Sisyphus (AI Agent)

---

## 概述

将 SmartLink vis 包支持的图表组件在组件管理页面展示出来，新增"可视化"分类，用户可以浏览和预览已实现的图表类型。

---

## 设计决策

### 1. 展示范围

只展示已实现的 3 种图表类型：

| 图表类型 | 中文名 | 实现状态 |
|---------|--------|---------|
| `line` | 折线图 | 已实现 |
| `bar` | 柱状图 | 已实现 |
| `pie` | 饼图 | 已实现 |

其余 5 种（area, scatter, summary, stat-card, table）仅定义为类型，未实现工厂，暂不展示。

### 2. 卡片布局

采用 **大预览图** 方案：

- 预览区域高度：120px
- 预览内容：G2 图表实际渲染
- 卡片信息区：图表名称 + 分类标签
- 卡片描述区：一句话功能描述

**卡片结构**：
```
┌─────────────────────────────────────┐
│  预览区 (120px)                      │
│  ┌─────────────────────────────┐    │
│  │ G2 图表渲染                  │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  图表名称          [可视化] 标签    │
├─────────────────────────────────────┤
│  功能描述（一句话）                  │
└─────────────────────────────────────┘
```

### 3. 分类位置

新增 `visual` 分类，放在"数据组件"和"业务组件"之间：

```
全部 → 基础 → 表单 → 布局 → 数据 → [可视化] → 业务
```

理由：图表是数据可视化的延伸，属于基础能力层，应在业务组件之前。

### 4. 预览数据

采用 **GPT VIS 风格真实示例数据**：

| 图表 | 示例主题 | 数据描述 |
|-----|---------|---------|
| 折线图 | 全球平均温度距平变化 | 时间序列数据，展示趋势 |
| 柱状图 | 各季度销售额对比 | 多类别对比数据 |
| 饼图 | 市场份额分布 | 占比分布数据 |

### 5. 图表图标

**不使用单独图标**。大预览图已经直观展示了图表类型，额外图标会显得冗余。

分类标签使用统一的"可视化"标识，颜色：`#10b981`（绿色）。

---

## 实现方案

### 文件修改清单

#### 1. 添加分类定义

**文件**: `packages/shared/src/constants/component-meta.ts`

```typescript
export const COMPONENT_CATEGORIES = [
  { value: 'all', label: '全部组件' },
  { value: 'basic', label: '基础组件' },
  { value: 'form', label: '表单组件' },
  { value: 'layout', label: '布局组件' },
  { value: 'data', label: '数据组件' },
  { value: 'visual', label: '可视化' },  // 新增
  { value: 'business', label: '业务组件' }
] as const
```

#### 2. 添加图表元数据

**文件**: `packages/shared/src/constants/component-meta.ts`

在 `COMPONENT_META_LIST` 中添加 3 个图表组件元数据：

```typescript
// 可视化组件 (Visual Components)
{
  type: 'VisLineChart',
  name: '折线图',
  category: 'visual',
  description: '展示数据随时间或有序类别的变化趋势',
  icon: 'chart-line',
  props: [...],
  examples: [...]
},
{
  type: 'VisBarChart',
  name: '柱状图',
  category: 'visual',
  description: '用于不同类别之间的数据对比展示',
  icon: 'chart-bar',
  props: [...],
  examples: [...]
},
{
  type: 'VisPieChart',
  name: '饼图',
  category: 'visual',
  description: '展示各部分在整体中的占比分布',
  icon: 'chart-pie',
  props: [...],
  examples: [...]
}
```

#### 3. 创建 VIS 卡片组件

**新文件**: `app/src/components/component/VISComponentCard.vue`

专门用于渲染图表预览的卡片组件，包含：
- G2 图表初始化和渲染
- 预览数据定义
- 响应式宽度处理
- 销毁清理

#### 4. 修改组件管理页

**文件**: `app/src/views/resource/ComponentManagement.vue`

根据分类切换卡片渲染组件：
- `visual` 分类 → 使用 `VISComponentCard`
- 其他分类 → 使用 `ComponentCard`

#### 5. 扩展布局预设

**文件**: `packages/shared/src/constants/component-meta.ts`

添加图表组件的布局预设：

```typescript
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

### 预览数据定义

```typescript
// 折线图示例数据 - 全球平均温度距平变化
const lineChartPreviewData = [
  { year: '1880', value: -0.12 },
  { year: '1900', value: -0.08 },
  { year: '1920', value: -0.25 },
  { year: '1940', value: 0.12 },
  { year: '1960', value: 0.03 },
  { year: '1980', value: 0.26 },
  { year: '2000', value: 0.42 },
  { year: '2020', value: 1.02 }
]

// 柱状图示例数据 - 各季度销售额对比
const barChartPreviewData = [
  { quarter: 'Q1', sales: 12500 },
  { quarter: 'Q2', sales: 18200 },
  { quarter: 'Q3', sales: 15600 },
  { quarter: 'Q4', sales: 22800 }
]

// 饼图示例数据 - 市场份额分布
const pieChartPreviewData = [
  { name: '产品A', value: 35 },
  { name: '产品B', value: 25 },
  { name: '产品C', value: 20 },
  { name: '其他', value: 20 }
]
```

---

## 技术约束

- Vue 组件使用 `<script setup lang="ts">` 风格
- 代码风格：无分号，单引号，2 空格缩进
- 图表引擎：G2 5.0（与 GPT VIS 一致）
- 国际化：分类标签需添加 i18n 支持

---

## 参考资源

- GPT VIS 库：`E:\programe\ai\gpt-vis`
- SmartLink vis 包：`packages/vis`
- 现有组件卡片：`app/src/components/component/ComponentCard.vue`

---

## 验收标准

1. 组件管理页面显示"可视化"分类标签
2. 点击"可视化"分类，显示 3 个图表卡片
3. 每个卡片正确渲染对应的 G2 图表预览
4. 卡片布局与设计稿一致（大预览图 120px）
5. 分类标签位置正确（数据 → 可视化 → 业务）