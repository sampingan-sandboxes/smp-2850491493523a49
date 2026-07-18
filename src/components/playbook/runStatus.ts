import type { PlaybookRunStatus } from '@/interfaces/playbook';

/**
 * YOUR TASK — the shared status → display metadata mapping used by BOTH the run-history
 * list rows and the run detail page, so the two stay visually consistent.
 *
 * Provide an entry for each of the four `PlaybookRunStatus` values with:
 *   - `label`: the human-readable status label.
 *   - `textClassName`: the Tailwind text-color class for the label.
 *   - `dotClassName`: the Tailwind background-color class for the status dot.
 *
 * Expected mapping:
 *   running   → { label: 'Running',   textClassName: 'text-primary',          dotClassName: 'bg-primary' }
 *   completed → { label: 'Completed', textClassName: 'text-foreground',       dotClassName: 'bg-foreground' }
 *   gated_out → { label: 'Gated out', textClassName: 'text-muted-foreground', dotClassName: 'bg-muted-foreground' }
 *   failed    → { label: 'Failed',    textClassName: 'text-destructive',      dotClassName: 'bg-destructive' }
 */
export const PLAYBOOK_RUN_STATUS_META: Record<
  PlaybookRunStatus,
  { label: string; textClassName: string; dotClassName: string }
> = {} as Record<PlaybookRunStatus, { label: string; textClassName: string; dotClassName: string }>;
