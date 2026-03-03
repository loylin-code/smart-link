# Input 输入框

通过鼠标或键盘输入内容。

## 基础用法

```vue
<template>
  <sl-input v-model="value" placeholder="请输入内容" />
</template>

<script setup>
  import { ref } from 'vue'
  const value = ref('')
</script>
```

## 禁用状态

使用 `disabled` 属性来禁用输入框。

```vue
<template>
  <sl-input v-model="value" disabled placeholder="禁用状态" />
</template>
```

## 密码输入框

使用 `type="password"` 来创建密码输入框。

```vue
<template>
  <sl-input v-model="password" type="password" placeholder="请输入密码" />
</template>
```

## 文本域

使用 `type="textarea"` 来创建文本域。

```vue
<template>
  <sl-input v-model="content" type="textarea" :rows="4" placeholder="请输入内容" />
</template>
```

## 字数限制

使用 `maxlength` 和 `show-count` 来限制输入字数并显示计数。

```vue
<template>
  <sl-input v-model="value" :maxlength="100" show-count placeholder="最多输入100个字符" />
</template>
```

## API

### Props

| 属性名      | 说明             | 类型                                             | 默认值   |
| ----------- | ---------------- | ------------------------------------------------ | -------- |
| v-model     | 绑定值           | `string \| number`                               | —        |
| type        | 输入框类型       | `'text' \| 'password' \| 'textarea' \| 'number'` | `'text'` |
| placeholder | 占位文本         | `string`                                         | —        |
| disabled    | 是否禁用         | `boolean`                                        | `false`  |
| readonly    | 是否只读         | `boolean`                                        | `false`  |
| maxlength   | 最大输入长度     | `number`                                         | —        |
| show-count  | 是否显示字数统计 | `boolean`                                        | `false`  |
| rows        | 文本域行数       | `number`                                         | `3`      |

### Events

| 事件名 | 说明           | 参数                  |
| ------ | -------------- | --------------------- |
| input  | 输入时触发     | `(value: string)`     |
| focus  | 获得焦点时触发 | `(event: FocusEvent)` |
| blur   | 失去焦点时触发 | `(event: FocusEvent)` |
