import type { ReactElement } from 'react';
import type { StoredTokens } from '@/components/auth/tokenStorage';

/**
 * YOUR TASK — implement the run detail page.
 *
 * Props: `{ user: StoredTokens | null }`. The playbook id and run id come from the route
 * params (`useParams<{ id: string; runId: string }>()` — the route is
 * `/playbooks/:id/runs/:runId`).
 *
 * Behaviour:
 * - If there is no `user`, render `<Navigate to="/login" replace />` (react-router).
 * - Otherwise, on mount load the run via `getPlaybookRun(user.idToken, id, runId)` from
 *   `../playbookRuns`. Note it uses the ID token as the bearer credential, not the OAuth
 *   access token.
 * - Render the provided `Header` (`@/base/components/Header`) with the decoded claims
 *   (`decodeIdToken(user.idToken)` from `@/components/auth/idToken`).
 * - While loading show "Loading…"; on failure show "Failed to load run".
 * - Once loaded, render: the status (via `PLAYBOOK_RUN_STATUS_META` from `../runStatus` — a
 *   coloured dot + label), the trigger slug + toolkit, the model, the created and completed
 *   timestamps (`new Date(...).toLocaleString()`, or "—" when there is no `completedAt`),
 *   the gate reasoning (falling back to "Evaluating…" when unset), the tool calls, and the
 *   response (falling back to "No response" when unset).
 * - Show an Error section ONLY for a failed run that carries an `error`.
 * - Tool calls: show "No tool calls" when empty; otherwise a collapsible row per call whose
 *   button is the tool call `name`. Expanding it reveals the `input` and `output` as
 *   pretty-printed JSON (`JSON.stringify(value, null, 2)`); collapsed rows must not render
 *   that JSON. Also link back to the parent playbook at `/playbooks/<id>`.
 *
 * Every branch returns an element, so the return type is `ReactElement`.
 */
function PlaybookRunPage(_props: { user: StoredTokens | null }): ReactElement {
  throw new Error('NotImplemented');
}

export default PlaybookRunPage;
