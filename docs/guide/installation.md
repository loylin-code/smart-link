# 安装

## npm

```bash
npm install @smart-link/ui @smart-link/hooks @smart-link/shared
```

## yarn

```bash
yarn add @smart-link/ui @smart-link/hooks @smart-link/shared
```

## pnpm

```bash
pnpm add @smart-link/ui @smart-link/hooks @smart-link/shared
```

## 完整引入

```ts
import { createApp } from 'vue'
import SmartLinkUI from '@smart-link/ui'
import '@smart-link/ui/style.css'

const app = createApp(App)
app.use(SmartLinkUI)
```

## 按需引入

```ts
import { SlButton, SlInput } from '@smart-link/ui'

app.component('SlButton', SlButton)
app.component('SlInput', SlInput)
```

## CDN

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script src="https://unpkg.com/@smart-link/ui/dist/index.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@smart-link/ui/dist/style.css" />

<script>
  const { createApp } = Vue
  const app = createApp()
  app.use(SmartLinkUI)
</script>
```
