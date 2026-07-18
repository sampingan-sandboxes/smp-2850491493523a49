# Requirements — Frontend Playbook Run-History Module

## Context

A React (Vite + React Router) single-page app. A **Playbook** is a user-configured automation:
a connected **trigger** (e.g. "New Gmail Message") plus a prompt that Claude runs whenever that
trigger fires. Each firing produces a **run**. This module owns the client-side surface for
choosing a playbook's trigger and for inspecting run history:

- searching the catalog of connected triggers,
- listing a playbook's runs and fetching a single run,
- mapping a run's status to consistent display metadata,
- the **TriggerCombobox** for searching and selecting a trigger,
- the **run detail page** that renders a single run.

The backend, the base config reader (`src/base/config.ts`), the design-system UI primitives
(`Command`, `DropdownMenu`, `Button`), the shared `Header`, the interfaces, and the msw backend
simulator are **provided**. You implement everything else under `src/components/playbook/`.

Authentication is out of scope here: a signed-in user is handed to the page as a
`StoredTokens` prop, and the auth helpers it needs (`decodeIdToken`, `signOut`) are provided
stubs. All backend calls authenticate with `authorization: Bearer <token>`.

## Functional requirements

### FR-1 — Trigger search (`triggers.ts`)
`searchTriggers(accessToken, query)` → `GET ${backendUrl}/triggers?search=<query>` with header
`authorization: Bearer <accessToken>`. The `search` param is **always** sent, even when the
query is empty (send `search=`, do not omit it). Non-OK → throw
`Failed to search triggers: <status>`. Success → the `triggers` array from `{ triggers }`.

### FR-2 — Run API clients (`playbookRuns.ts`)
- `listPlaybookRuns(accessToken, playbookId)` → `GET ${backendUrl}/playbooks/<playbookId>/runs`.
  Non-OK → throw `Failed to load playbook runs: <status>`. Success → `runs` from `{ runs }`.
- `getPlaybookRun(accessToken, playbookId, runId)` →
  `GET ${backendUrl}/playbooks/<playbookId>/runs/<runId>`. Non-OK → throw
  `Failed to load playbook run: <status>`. Success → `run` from `{ run }`.

### FR-3 — Run-status metadata (`runStatus.ts`)
`PLAYBOOK_RUN_STATUS_META`: a `Record<PlaybookRunStatus, { label, textClassName, dotClassName }>`
shared by the history list rows and the detail page so the two stay visually consistent.

| status | label | textClassName | dotClassName |
|--------|-------|---------------|--------------|
| `running` | Running | `text-primary` | `bg-primary` |
| `completed` | Completed | `text-foreground` | `bg-foreground` |
| `gated_out` | Gated out | `text-muted-foreground` | `bg-muted-foreground` |
| `failed` | Failed | `text-destructive` | `bg-destructive` |

### FR-4 — TriggerCombobox (`components/TriggerCombobox.tsx`)
Props: `{ idToken, selected: PlaybookTrigger | null, onSelect, disabled? }`.
- No selection (or search reopened): render a search combobox built from the provided
  `Command`/`CommandInput`/`CommandList`/`CommandEmpty`/`CommandItem` (`shouldFilter={false}`).
- Search only after the combobox has been opened (focus opens it). Debounce the query
  (~250 ms), call `searchTriggers(idToken, query)`, and render each result as a `CommandItem`
  (role `option`) showing its name and `toolkitName ?? toolkit`. Cancel stale in-flight
  searches so a late response can't overwrite a newer query. Empty results show
  "No connected triggers found".
- Clicking outside closes the list. Choosing an option calls `onSelect(trigger)` and collapses.
- With a selection and the search closed: show a summary card
  (`data-testid="selected-trigger"`) with the trigger name + toolkit and a "Change" button
  that reopens the search.
- While `disabled`: disable the input and, in the summary, show a spinner (`Loader2Icon`,
  `aria-label="Saving"`) instead of "Change".

### FR-5 — Run detail page (`pages/PlaybookRunPage.tsx`)
Props: `{ user: StoredTokens | null }`; `id` and `runId` come from the route params
(`/playbooks/:id/runs/:runId`).
- No `user` → `<Navigate to="/login" replace />`.
- On mount load the run via `getPlaybookRun(user.idToken, id, runId)` — note it uses the **ID
  token**, not the OAuth access token. Render the `Header` with `decodeIdToken(user.idToken)`.
- While loading → "Loading…"; on failure → "Failed to load run".
- Loaded, render: the status (coloured dot + label from `PLAYBOOK_RUN_STATUS_META`); the trigger
  slug + toolkit; the model; created and completed timestamps
  (`new Date(...).toLocaleString()`, `—` when no `completedAt`); the gate reasoning
  (fallback "Evaluating…" when unset); the tool calls; and the response (fallback
  "No response" when unset). Link back to the parent playbook at `/playbooks/<id>`.
- Error section renders **only** for a `failed` run that carries an `error`.
- Tool calls: "No tool calls" when empty; otherwise a collapsible row per call, its button
  labelled with the tool call `name`. Expanding reveals `input` and `output` as
  `JSON.stringify(value, null, 2)`; a collapsed row must not render that JSON.

## Non-functional requirements
- TypeScript strict; `npm run lint` (oxlint) + `npm run build` (`tsc -b && vite build`) clean.
- Keep file paths and export signatures. Do not modify provided files.
- React component skeletons declare an explicit `: ReactElement` return type — keep it.

See [specifications.md](specifications.md) and [features/](features/).
