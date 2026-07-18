// Mirrors playbook-backend/src/playbook-config/types.ts's PlaybookTrigger.
export interface PlaybookTrigger {
  slug: string;
  toolkit: string;
  name: string;
  // Both optional — playbooks whose trigger was selected before these fields existed have
  // them missing from their stored document, not merely null.
  toolkitName?: string;
  logo?: string | null;
}

// Mirrors playbook-backend/src/playbook-config/types.ts's PlaybookModel.
export type PlaybookModel = 'claude-haiku-4-5-20251001' | 'claude-sonnet-5';

// Mirrors playbook-backend/src/playbook-config/types.ts's Playbook.
// `prompt` is opaque BlockNote block JSON — left untyped here so this API layer
// doesn't depend on the editor library; narrowed to Block[] where it's rendered.
export interface Playbook {
  id: string;
  userId: string;
  title: string;
  trigger: PlaybookTrigger | null;
  // Server-derived: the live Composio trigger instance backing `trigger`, if activated.
  triggerInstanceId: string | null;
  triggerDescription: string;
  prompt: unknown[];
  model: PlaybookModel;
  createdAt: string;
  updatedAt: string;
  // Soft-delete marker — null while live. The backend never returns a deleted playbook
  // through list/get, so this is effectively always null wherever the frontend sees it.
  deletedAt: string | null;
}
