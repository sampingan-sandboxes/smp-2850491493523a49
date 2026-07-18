import type { PlaybookModel } from './playbook-config';

// Mirrors playbook-backend/src/playbook/types.ts's PlaybookRunStatus. 'running'
// is the initial status a run is created with, before the gate has decided.
export type PlaybookRunStatus = 'running' | 'gated_out' | 'completed' | 'failed';

// Mirrors playbook-backend/src/playbook/types.ts's PlaybookRunToolCall.
export interface PlaybookRunToolCall {
  name: string;
  input: Record<string, unknown>;
  output: unknown;
}

// Mirrors playbook-backend/src/playbook/types.ts's PlaybookRun.
// Backend Dates (createdAt/completedAt) are serialized as ISO strings over the wire,
// same as Playbook's createdAt/updatedAt in playbook-config/types.ts.
export interface PlaybookRun {
  id: string;
  playbookId: string;
  userId: string;
  triggerSlug: string;
  toolkitSlug: string;
  webhookEventId: string;
  triggerPayload: Record<string, unknown>;
  model: PlaybookModel;
  status: PlaybookRunStatus;
  // Unset until the gate actually decides — the record exists before that point.
  gateReasoning?: string;
  response?: string;
  toolCalls: PlaybookRunToolCall[];
  error?: string;
  createdAt: string;
  completedAt?: string;
}
