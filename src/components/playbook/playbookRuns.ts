import { backendUrl } from '@/base/config';
import type { PlaybookRun } from '@/interfaces/playbook';

/**
 * YOUR TASK — the run-history API clients. Both authenticate with
 * `authorization: Bearer <accessToken>`.
 *
 * - listPlaybookRuns(accessToken, playbookId): GET `${backendUrl}/playbooks/<playbookId>/runs`.
 *   On non-OK throw `Failed to load playbook runs: <status>`. Success → the `runs` from
 *   `{ runs }`.
 * - getPlaybookRun(accessToken, playbookId, runId): GET
 *   `${backendUrl}/playbooks/<playbookId>/runs/<runId>`. On non-OK throw
 *   `Failed to load playbook run: <status>`. Success → the `run` from `{ run }`.
 */
export async function listPlaybookRuns(_accessToken: string, _playbookId: string): Promise<PlaybookRun[]> {
  void backendUrl;
  throw new Error('NotImplemented');
}

export async function getPlaybookRun(
  _accessToken: string,
  _playbookId: string,
  _runId: string,
): Promise<PlaybookRun> {
  void backendUrl;
  throw new Error('NotImplemented');
}
