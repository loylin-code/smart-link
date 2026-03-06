# @smart-link/ui

Vue 3 component library with 25+ components.

## STRUCTURE

```
src/components/
├── basic/           # Icon, Tag, Badge, Avatar, Divider, Link, Image, Typography
├── form/            # Input, Select, Checkbox, Radio, Switch, Form, FormItem
├── layout/          # Container, Row, Col, Card, Space
├── feedback/        # Modal, Message, Tooltip
└── index.ts         # Component exports
```

## WHERE TO LOOK

| Task             | Location                     | Notes                                                 |
| ---------------- | ---------------------------- | ----------------------------------------------------- |
| Add component    | `src/components/{category}/` | Create folder with `.vue` + `index.ts`                |
| Export component | `src/components/index.ts`    | `export { default as SlName } from './category/name'` |
| Global styles    | `src/styles/`                | Shared SCSS variables                                 |

## CONVENTIONS

**Naming:** `Sl` prefix (SlButton, SlInput). Single-word component names OK.

**File Pattern:**

```
button/
├── button.vue      # Component + styles
└── index.ts        # Install function + export
```

**Props Pattern:**

```ts
interface Props {
  type?: 'primary' | 'default'
}
const props = withDefaults(defineProps<Props>(), { type: 'default' })
```

**v-model:** Use `modelValue` prop + `update:modelValue` emit.

**Form Integration:** Form provides context via `provide('form', reactive({...}))`. FormItem injects and reads `labelWidth`.

**Overlays (Modal/Tooltip):** Use `<Teleport to="body">` + `<Transition>` wrappers.

**CSS (BEM-like):**

- Block: `.sl-button`
- Modifier: `.sl-button--primary`, `.sl-button--small`
- State: `.is-disabled`, `.is-loading`
- Element: `.sl-modal__header`

**Install Pattern (index.ts):**

```ts
import Comp from './comp.vue'
Comp.install = (app: App) => app.component('SlName', Comp)
export default Comp
```

## ANTI-PATTERNS

- **Don't** use `v-deep` without `scoped` style
- **Don't** hardcode colors, use SCSS variables
- **Don't** forget `withDefaults` for optional props
