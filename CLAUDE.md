# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartLink Enterprise Agent Platform is a Role-based intelligent enterprise Agent application management platform. It builds digital employees through different roles of agents, creating a systematic and standardized interaction system.

**Core call chain:**
Terminal (Web/Mobile) → Gateway → Router Agent → Execution Agent → Intent Recognition/MCP/SKILL/TOOL → LLM Response → Visual Content

## Build Commands

```bash
# Install dependencies (uses pnpm workspaces)
pnpm install

# Start main app development server (port 3000)
pnpm dev

# Start playground for component testing
pnpm play

# Start documentation site
pnpm docs

# Build all packages and app
pnpm build

# Build only library packages
pnpm build:lib

# Lint code
pnpm lint

# Format code
pnpm format
```

## Package Scripts

Each package under `packages/` uses a shared Rollup config:
```bash
pnpm -F @smart-link/hooks build    # Build specific package
pnpm -F @smart-link/ui build       # Build UI components
```

## Architecture

This is a **pnpm monorepo** with the following structure:

```
smart-link/
├── app/                    # Main Vue 3 application
├── packages/
│   ├── core/               # Page orchestration rendering engine
│   ├── ui/                 # Vue 3 UI component library
│   ├── hooks/              # Vue composition functions
│   ├── shared/             # Shared utilities and types
│   └── theme/              # Theme system (SCSS variables)
├── play/                   # Component playground
├── docs/                   # VitePress documentation site
└── internal/build/         # Shared Rollup configuration
```

### Key Technologies

- **Vue 3.4+** with Composition API and `<script setup>`
- **TypeScript 5.4+**
- **Vite 5.0+** for development and build
- **Pinia** with persistedstate plugin for state management
- **Vue Router 4** with i18n support for routes
- **OpenTiny Vue** as base UI component library
- **Sass/SCSS** for styling with shared variables
- **Turbo** for monorepo build orchestration
- **Rollup** for library builds

### Package Dependencies

```
@smart-link/theme     ← (no dependencies)
@smart-link/shared    ← depends on nothing
@smart-link/hooks     ← depends on @smart-link/shared
@smart-link/core      ← depends on @smart-link/shared, @smart-link/hooks
@smart-link/ui        ← depends on @smart-link/shared, @smart-link/hooks, @smart-link/theme
```

Build order matters: `shared` → `hooks` → `core`/`theme` → `ui`

## Core Modules

### @smart-link/core

The orchestration engine exports:
- `createExpressionEvaluator` / `createSimpleEvaluator` - Expression evaluation
- `createStateManager` - State management for page schemas
- `createComponentRegistry` / `getGlobalRegistry` - Component registration
- `createEventProcessor` - Event handling
- `createDirectiveProcessor` - Custom directives
- `createRenderer` / `createFullRenderer` - Schema to Vue component rendering

### @smart-link/ui

UI components organized by category:
- `basic/` - icon, badge, avatar, image, typography, link, tag, divider
- `form/` - form, form-item, input, button, checkbox, radio, select, switch
- `layout/` - container, row, col, space, card
- `feedback/` - message, tooltip, modal
- `drawer/` - drawer component

## App Structure

```
app/src/
├── main.ts              # App entry, registers Pinia, Router, i18n
├── router/index.ts      # Route definitions with i18n title support
├── store/               # Pinia stores (app, explore, orchestrator, etc.)
├── services/            # API services (ai, websocket, application, etc.)
├── types/index.ts       # TypeScript interfaces for all entities
├── locales/             # i18n files (zh-CN.ts, en-US.ts)
├── views/               # Page components
├── components/          # Shared components (layout, orchestrator, ai, etc.)
└── assets/styles/       # Global SCSS with variables
```

### Key Route Patterns

- `/` - Welcome page
- `/app/explore` - Main exploration view
- `/app/application/*` - Application management (list, design, orchestration, runtime)
- `/app/resource/*` - Resource management (components, datamodel)
- `/app/tool/*` - Tool management (mcp, skills, models)
- `/app/settings/*` - System settings (appearance, providers)

### State Management Pattern

Pinia stores in `store/modules/` follow this pattern:
- Use `pinia-plugin-persistedstate` for persistence
- Export composable functions like `useAppStore()`, `useOrchestratorStore()`

## Development Conventions

### Path Aliases (in vite.config.ts)

```typescript
'@': './src'
'@smart-link/shared': '../packages/shared/src'
'@smart-link/ui': '../packages/ui/src'
'@smart-link/hooks': '../packages/hooks/src'
'@smart-link/core': '../packages/core/src'
```

### SCSS Variables

Global SCSS variables in `app/src/assets/styles/variables.scss` are auto-injected via vite config. The theme package also provides variables at `@smart-link/theme/styles/variables.scss`.

### Rollup Build

Library packages use `internal/build/rollup.config.js` which:
- Outputs both ESM (`.mjs`) and CJS (`.js`) formats
- Preserves module structure for tree-shaking
- Handles Vue SFC compilation
- Auto-injects SCSS variables if present

### Route Meta Pattern

Routes use `titleKey` for i18n with fallback `title`:
```typescript
meta: {
  title: '应用管理',
  titleKey: 'route.application',
  icon: 'app'
}
```

## Environment Variables

Copy `app/.env.example` to `app/.env.local`:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket URL
- `VITE_API_KEY` - API key for development

## Release Process

Uses Changesets for versioning:
```bash
pnpm changeset          # Create a changeset
pnpm version            # Version packages
pnpm release            # Build and publish to npm
```