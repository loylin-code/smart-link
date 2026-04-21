# UI COMPONENT LIBRARY

Vue 3 component library for @smart-link/ui. Schema-driven components with Sl prefix.

## STRUCTURE

```
components/
├── basic/       # Typography, Tag, Link, Image, Icon, Divider, Badge, Avatar
├── form/        # Form, FormItem, Checkbox, Radio, Select, Switch
├── layout/      # Container, Row, Col, Card, Space
├── feedback/    # Modal, Tooltip, Message
├── data/        # Table, Chart, StatCard, Progress
├── button/      # Button (flat, outside categories)
├── input/       # Input (flat, outside categories)
└── drawer/      # Drawer (flat, outside categories)
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add basic component | `basic/{component}/` |
| Add form component | `form/{component}/` |
| Add data visualization | `data/{component}/` |
| Component styles | `{category}/{component}/style/index.ts` |
| Barrel exports | `{category}/{component}/index.ts` |

## CONVENTIONS

**Naming:**
- Vue file: `button.vue` (single word, lowercase)
- Export prefix: `SlButton` (Sl + PascalCase)
- Each component has own `index.ts` barrel

**Props:**
- `defineProps<Props>()` with `withDefaults()`
- TypeScript strict mode

**Styles:**
- SCSS with `variables.scss` auto-inject
- Separate `style/index.ts` for CSS exports

## ANTI-PATTERNS

- Flat folders (`button/`, `input/`, `drawer/`) outside category structure
- Should be consolidated into proper categories