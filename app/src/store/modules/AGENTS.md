# STORE MODULES

Pinia state management for the main application. Uses pinia-plugin-persistedstate for selective persistence.

## MODULES

| File              | Lines | Purpose                                            | Persistence                            |
| ----------------- | ----- | -------------------------------------------------- | -------------------------------------- |
| `app.ts`          | 69    | UI state (sidebar, theme, console)                 | No                                     |
| `ai.ts`           | 287   | AI config, conversation history, async LLM calls   | `config`, `panelVisible`, `panelWidth` |
| `application.ts`  | 175   | Application CRUD, filtering, pagination            | `filter`, `pagination`                 |
| `explore.ts`      | 828   | Chat conversation management, SSE streaming        | `activeConversationId`, `pagination`   |
| `orchestrator.ts` | 752   | Design canvas state, selection, history, drag/drop | Panel layout, grid settings            |

## WHERE TO LOOK

| Task             | Location                                               |
| ---------------- | ------------------------------------------------------ |
| AI service calls | `ai.ts` actions call `aiService` directly              |
| Canvas viewport  | `orchestrator.ts` `canvas` state                       |
| Schema mutations | `orchestrator.ts` actions (addNode, updateProps, etc.) |
| App CRUD ops     | `application.ts` (mostly stubs, needs API integration) |
| Chat history     | `explore.ts` conversation management                   |

## CONVENTIONS

**Store Pattern:**

- Options API style: `state`, `getters`, `actions`
- Define interfaces for state (e.g., `AIState`, `AppState`)
- Async actions call services directly, no thunk middleware

**Persistence:**

```typescript
persist: {
  key: 'smart-link-{store-name}',
  paths: ['specific.field'] // Never persist entire state
}
```

**Naming:**

- Store IDs: lowercase (`'app'`, `'ai'`, `'orchestrator'`)
- Use `use{Pascal}Store` for composable names
- Prefix unused params with `_`

## ANTI-PATTERNS

**orchestrator.ts complexity (752 lines):**

- Contains tree traversal business logic (`findNodeById`, `checkDescendant`) at bottom of file
- Should move to `services/tree-operations.ts` or similar
- Store should only hold state and call services, not implement algorithms

**Missing:**

- No centralized error handling pattern across async actions
- Some stores (application.ts) have stub actions without API integration
