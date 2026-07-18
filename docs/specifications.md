# Module Specification — frontend playbook run history

## Files you implement (`src/components/playbook/`)

| File | Exports |
|------|---------|
| `triggers.ts` | `searchTriggers(accessToken, query)` |
| `playbookRuns.ts` | `listPlaybookRuns(accessToken, playbookId)`, `getPlaybookRun(accessToken, playbookId, runId)` |
| `runStatus.ts` | `PLAYBOOK_RUN_STATUS_META` |
| `components/TriggerCombobox.tsx` | default `TriggerCombobox` |
| `pages/PlaybookRunPage.tsx` | default `PlaybookRunPage({ user })` |

## Provided — do not modify

| File | Role |
|------|------|
| `src/base/config.ts` | `backendUrl` |
| `src/base/components/ui/command.tsx` | `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandItem` |
| `src/base/components/ui/dropdown-menu.tsx`, `ui/button.tsx` | design-system primitives used by `Header` |
| `src/base/components/Header.tsx` | app header (renders the signed-in user) |
| `src/base/lib/utils.ts` | `cn` |
| `src/base/lib/idbStore.ts`, `src/base/mocks/**`, `src/base/test/**` | msw simulator + test harness |
| `src/interfaces/playbook.ts` | `PlaybookRun`, `PlaybookRunStatus`, `PlaybookRunToolCall` |
| `src/interfaces/playbook-config.ts` | `PlaybookTrigger`, `PlaybookModel`, `Playbook` |
| `src/components/playbook/mocks.ts` | the msw backend simulator for the playbook endpoints |
| `src/components/auth/{idToken,tokenStorage,auth,mocks}.ts`, `src/components/playbook-config/mocks.ts` | cross-module stubs |
| `src/App.tsx`, `src/main.tsx` | dev harness |

## Endpoints & shapes

| Call | Request | Response |
|------|---------|----------|
| Search triggers | `GET ${backendUrl}/triggers?search=<q>` header `authorization: Bearer <token>` | `{ triggers: PlaybookTrigger[] }` |
| List runs | `GET ${backendUrl}/playbooks/<id>/runs` header `authorization: Bearer <token>` | `{ runs: PlaybookRun[] }` |
| Get run | `GET ${backendUrl}/playbooks/<id>/runs/<runId>` header `authorization: Bearer <token>` | `{ run: PlaybookRun }` |

`PlaybookRun` (see `src/interfaces/playbook.ts`): `id, playbookId, userId, triggerSlug, toolkitSlug,
webhookEventId, triggerPayload, model, status, gateReasoning?, response?, toolCalls[], error?,
createdAt, completedAt?`. `status ∈ { running, gated_out, completed, failed }`. Dates are ISO
strings. `gateReasoning`, `response`, `error`, and `completedAt` are optional — a `running` run
has none of them yet.

## Status → display metadata

| status | label | textClassName | dotClassName |
|--------|-------|---------------|--------------|
| `running` | Running | `text-primary` | `bg-primary` |
| `completed` | Completed | `text-foreground` | `bg-foreground` |
| `gated_out` | Gated out | `text-muted-foreground` | `bg-muted-foreground` |
| `failed` | Failed | `text-destructive` | `bg-destructive` |

## Env (from `.env.test`)

`VITE_BACKEND_URL=http://backend.test` (the only var the module needs at test time);
`VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID`, and `VITE_ENABLE_MOCKS=true` are also set.

## Acceptance

The features in [features/](features/) run via jest-cucumber suites under
`tests/` (Vitest + jsdom, `globals: true`). The API/status suite
(`*.steps.ts`) drives your clients against the msw `server`; the component/page suites
(`*.steps.tsx`) render your components with React Testing Library inside a `MemoryRouter`. Your
own unit tests must bring total coverage of the files you write to **100%** (verify with
`npm run test:coverage` — thresholds are enforced). The provided `mocks.ts` and the acceptance
suites are excluded from coverage.
