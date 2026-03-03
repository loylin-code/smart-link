# Button 按钮

常用的操作按钮。

## 基础用法

使用 `type` 属性来定义按钮的样式。

```vue
<template>
  <sl-button type="primary">主要按钮</sl-button>
  <sl-button type="default">默认按钮</sl-button>
  <sl-button type="danger">危险按钮</sl-button>
  <sl-button type="success">成功按钮</sl-button>
</template>
```

## 尺寸

使用 `size` 属性设置按钮尺寸，支持 `small`、`medium`、`large` 三种尺寸。

```vue
<template>
  <sl-button size="small">小型按钮</sl-button>
  <sl-button size="medium">中型按钮</sl-button>
  <sl-button size="large">大型按钮</sl-button>
</template>
```

## 禁用状态

使用 `disabled` 属性来禁用按钮。

```vue
<template>
  <sl-button disabled>禁用按钮</sl-button>
</template>
```

## 加载状态

使用 `loading` 属性来显示加载状态。

```vue
<template>
  <sl-button loading>加载中</sl-button>
</template>
```

## API

### Props

| 属性名   | 说明       | 类型                                                           | 默认值      |
| -------- | ---------- | -------------------------------------------------------------- | ----------- |
| type     | 按钮类型   | `'primary' \| 'default' \| 'danger' \| 'warning' \| 'success'` | `'default'` |
| size     | 按钮尺寸   | `'small' \| 'medium' \| 'large'`                               | `'medium'`  |
| disabled | 是否禁用   | `boolean`                                                      | `false`     |
| loading  | 是否加载中 | `boolean`                                                      | `false`     |

### Events

| 事件名 | 说明           | 参数                  |
| ------ | -------------- | --------------------- |
| click  | 点击按钮时触发 | `(event: MouseEvent)` |

### Slots

| 插槽名  | 说明     |
| ------- | -------- |
| default | 按钮内容 |
