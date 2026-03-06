# @smart-link/core

## OVERVIEW

Schema-driven page rendering engine. Transforms PageSchema JSON into Vue VNodes.

## STRUCTURE

```
src/
├── types/              # Core type definitions (PageSchema, ComponentNode, etc.)
├── renderer/           # createRenderer() - main rendering pipeline
├── registry/           # Component registration & lookup
├── state/              # Reactive state manager with path-based access
├── evaluator/          # Safe expression evaluation (state.form.name, etc.)
├── events/             # Event handler execution (builtin, custom, API, state)
└── directives/         # v-if, v-for, v-model processing
```

## WHERE TO LOOK

| Task                      | Module      | Notes                               |
| ------------------------- | ----------- | ----------------------------------- |
| Add rendering plugin      | renderer/   | Implements RendererPlugin interface |
| Register component        | registry/   | Sync or async lazy loading          |
| Handle new builtin action | events/     | Add to registerBuiltinActions()     |
| Add expression syntax     | evaluator/  | Modify createSafeFunction()         |
| New directive type        | directives/ | Extend DirectiveProcessor interface |
| Schema types              | types/      | PageSchema, ComponentNode, etc.     |

## CONVENTIONS

**Rendering Pipeline:**

```
PageSchema
  → createRenderer()          // entry point
    → processCondition()      // v-if handling
    → processLoop()           // v-for handling
    → registry.get()          // component lookup
    → resolveProps()          // static + dynamic bindings
    → resolveEvents()         // event handler binding
    → h(component, props)     // Vue VNode creation
```

**State Paths:** Support dot notation (`user.profile.name`) and brackets (`users[0].name`).

**Safe Evaluation:** Expressions run in sandboxed Proxy with forbidden paths blocked (`window`, `document`, `eval`).

**Subpath Imports:**

```typescript
import { createRenderer } from '@smart-link/core/renderer'
import { createComponentRegistry } from '@smart-link/core/registry'
import type { PageSchema } from '@smart-link/core/types'
```
