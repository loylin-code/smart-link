# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-05
**Commit:** ffbaead
**Branch:** main

## OVERVIEW

AI-powered page orchestration platform. Vue 3.4 + TypeScript monorepo using pnpm workspaces + Turborepo. Natural language → Schema-driven pages → Vue/React/HTML export.

## STRUCTURE

```
smart-link/
├── packages/           # 5 publishable npm packages
│   ├── core/           # @smart-link/core - Page rendering engine
│   ├── ui/             # @smart-link/ui - Vue 3 component library
│   ├── shared/         # @smart-link/shared - Types, constants, utils
│   ├── hooks/          # @smart-link/hooks - Vue composables
│   └── theme/          # @smart-link/theme - Theme styles
├── app/                # Main application (orchestrator UI)
├── docs/               # VitePress documentation
├── play/               # Component playground
└── internal/build/     # Shared Rollup configs
```

## WHERE TO LOOK

| Task               | Location                                          | Notes                                   |
| ------------------ | ------------------------------------------------- | --------------------------------------- |
| Add UI component   | `packages/ui/src/components/{category}/`          | Category: basic, form, layout, feedback |
| Modify renderer    | `packages/core/src/renderer/`                     | Schema → VNode conversion               |
| Add store module   | `app/src/store/modules/`                          | Pinia + persistedstate                  |
| AI integration     | `app/src/services/ai.ts`                          | OpenAI/Claude/Ollama                    |
| Code export        | `app/src/services/code-export.ts`                 | Vue SFC/React/HTML                      |
| Orchestrator UI    | `app/src/components/orchestrator/`                | Drag-drop editor                        |
| Component metadata | `packages/shared/src/constants/component-meta.ts` | Registry definitions                    |
| Shared types       | `packages/shared/src/types/`                      | Core type definitions                   |

## CONVENTIONS

**Code Style (Prettier/ESLint):**

- No semicolons, single quotes, 2-space indent
- Prefix unused vars with `_` to avoid lint errors
- Single-word component names allowed (`Button.vue` not `SlButton.vue`)

**TypeScript:**

- `script setup lang="ts"` for all Vue components
- Props defined via `defineProps<Props>()` with defaults via `withDefaults()`
- Strict mode enabled, ES2020 target

**Package Exports:**

- Each package has subpath exports: `@smart-link/core/types`, `@smart-link/core/state`, etc.
- Build via shared Rollup config: `rollup -c ../../internal/build/rollup.config.js`

## ANTI-PATTERNS (THIS PROJECT)

**Build Artifacts in Source:**

- `.js`, `.d.ts`, `.js.map` files in `app/src/` are generated artifacts
- Should be gitignored and output to `dist/`
- Fix: Add `src/**/*.js`, `src/**/*.d.ts`, `src/**/*.js.map` to `.gitignore`

**Store Business Logic:**

- `orchestrator.ts` (752 lines) contains tree traversal logic
- Should move to service layer

**Missing Test Infrastructure:**

- No test runner configured
- Testing is roadmap item, not implemented

## UNIQUE STYLES

**Component Naming:**

- Library components use `Sl` prefix (`SlButton`, `SlInput`)
- App components use semantic names (`AppLayout`, `DesignCanvas`)

**Store Pattern:**

- Pinia Options API style with `state`, `getters`, `actions`
- Selective persistence via `pinia-plugin-persistedstate`
- Async actions call services directly

**Schema-Driven Rendering:**

- `PageSchema` → `ComponentNode` tree → VNode via `createRenderer()`
- Expression evaluator for dynamic prop values
- Event processor for handler binding

## COMMANDS

```bash
pnpm dev        # Start main app
pnpm play       # Component playground
pnpm docs       # Documentation site
pnpm build      # Build all (Turbo)
pnpm build:lib  # Build packages only
pnpm lint       # ESLint with --fix
pnpm format     # Prettier formatting
```

## NOTES

- **No CI/CD**: No `.github/workflows` - manual testing only
- **Monorepo**: Use `pnpm -F @smart-link/app dev` for specific package
- **AI Config**: Set `VITE_OPENAI_API_KEY` for AI features
- **i18n**: Locales in `app/src/locales/` (zh-CN, en-US)
