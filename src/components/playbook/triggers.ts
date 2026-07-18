import { backendUrl } from '@/base/config';
import type { PlaybookTrigger } from '@/interfaces/playbook-config';

/**
 * YOUR TASK — search the catalog of connected triggers.
 *
 * GET `${backendUrl}/triggers?search=<query>` with header
 * `authorization: Bearer <accessToken>`. The search query is ALWAYS sent as an explicit
 * `search=` param, even when empty (an empty query must send `search=`, not omit it).
 * On a non-OK response throw `Failed to search triggers: <status>`. On success the backend
 * returns `{ triggers }`; resolve that array.
 */
export async function searchTriggers(_accessToken: string, _query: string): Promise<PlaybookTrigger[]> {
  void backendUrl;
  throw new Error('NotImplemented');
}
