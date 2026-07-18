// PROVIDED — do not modify. The msw backend simulator for the playbook run endpoints;
// used by both the test server and (in dev) the browser worker.
import { http, HttpResponse } from 'msw';
import { backendUrl } from '@/base/config';
import { createIdbStore } from '@/base/lib/idbStore';
import { requireBearer } from '@/base/mocks/requireBearer';
import { mockUser } from '@/components/auth/mocks';
import { findLivePlaybook } from '@/components/playbook-config/mocks';
import type { Playbook, PlaybookTrigger } from '@/interfaces/playbook-config';
import type { PlaybookRun } from '@/interfaces/playbook';

export const mockTriggerCatalog: PlaybookTrigger[] = [
  { slug: 'GMAIL_NEW_GMAIL_MESSAGE', toolkit: 'gmail', name: 'New Gmail Message' },
  { slug: 'SLACK_CHANNEL_MESSAGE_RECEIVED', toolkit: 'slack', name: 'Slack Channel Message Received' },
  { slug: 'GOOGLECALENDAR_EVENT_STARTING_SOON_TRIGGER', toolkit: 'googlecalendar', name: 'Event Starting Soon' },
];

// Keyed by playbookId -> its runs (newest first isn't enforced here; the list handler
// below sorts on read, mirroring the real backend). IndexedDB-backed for the same
// reload-survival reason as playbook-config/mocks.ts's playbooks store.
const playbookRuns = createIdbStore<Record<string, PlaybookRun[]>>('msw-playbookRuns-mock', 'state', 'runs', {});

export async function resetPlaybookRunsMock(): Promise<void> {
  await playbookRuns.set({});
}

async function getRunsForPlaybook(playbookId: string): Promise<PlaybookRun[] | undefined> {
  const all = await playbookRuns.get();
  return all[playbookId];
}

async function setRunsForPlaybook(playbookId: string, runs: PlaybookRun[]): Promise<void> {
  const all = await playbookRuns.get();
  await playbookRuns.set({ ...all, [playbookId]: runs });
}

// There's no real webhook flow to generate runs locally, so the History tab is seeded
// lazily the first time a given playbook's runs are requested: three example runs (one of
// each status) built from that playbook's own trigger where set, falling back to a Gmail
// example otherwise. Throwaway dev-fixture data — not meant to model the real gating/
// execution pipeline.
function buildSeedRuns(playbook: Playbook): PlaybookRun[] {
  const triggerSlug = playbook.trigger?.slug ?? 'GMAIL_NEW_GMAIL_MESSAGE';
  const toolkitSlug = playbook.trigger?.toolkit ?? 'gmail';
  const now = Date.now();
  const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

  const completed: PlaybookRun = {
    id: crypto.randomUUID(),
    playbookId: playbook.id,
    userId: mockUser.sub,
    triggerSlug,
    toolkitSlug,
    webhookEventId: `evt-${crypto.randomUUID()}`,
    triggerPayload: { subject: 'Q3 budget review', from: 'finance@example.com' },
    model: playbook.model ?? 'claude-haiku-4-5-20251001',
    status: 'completed',
    gateReasoning: 'Message matches the described trigger conditions — proceeding with the prompt.',
    response: 'Drafted a reply summarizing the Q3 budget review and flagged two line items for follow-up.',
    toolCalls: [
      {
        name: 'GMAIL_SEND_EMAIL',
        input: { to: 'finance@example.com', subject: 'Re: Q3 budget review', body: 'Thanks for sending this over…' },
        output: { messageId: 'mock-message-id-1', status: 'sent' },
      },
    ],
    createdAt: minutesAgo(12),
    completedAt: minutesAgo(11),
  };

  const gatedOut: PlaybookRun = {
    id: crypto.randomUUID(),
    playbookId: playbook.id,
    userId: mockUser.sub,
    triggerSlug,
    toolkitSlug,
    webhookEventId: `evt-${crypto.randomUUID()}`,
    triggerPayload: { subject: 'Weekly newsletter', from: 'noreply@newsletter.example.com' },
    model: playbook.model ?? 'claude-haiku-4-5-20251001',
    status: 'gated_out',
    gateReasoning: 'Message looks like a bulk newsletter, not the kind of event this playbook should act on — skipped.',
    toolCalls: [],
    createdAt: minutesAgo(90),
    completedAt: minutesAgo(90),
  };

  const failed: PlaybookRun = {
    id: crypto.randomUUID(),
    playbookId: playbook.id,
    userId: mockUser.sub,
    triggerSlug,
    toolkitSlug,
    webhookEventId: `evt-${crypto.randomUUID()}`,
    triggerPayload: { subject: 'Contract renewal', from: 'legal@example.com' },
    model: playbook.model ?? 'claude-haiku-4-5-20251001',
    status: 'failed',
    gateReasoning: 'Message matches the described trigger conditions — proceeding with the prompt.',
    toolCalls: [],
    error: 'Composio tool call GMAIL_SEND_EMAIL failed: connected account token expired.',
    createdAt: minutesAgo(1440),
    completedAt: minutesAgo(1439),
  };

  return [completed, gatedOut, failed];
}

// Mirrors the response shapes of playbook-backend's src/playbook/handlers/*.ts.
export const playbookHandlers = [
  http.get(`${backendUrl}/triggers`, ({ request }) => {
    const unauthorized = requireBearer(request);
    if (unauthorized) return unauthorized;
    const search = new URL(request.url).searchParams.get('search')?.toLowerCase() ?? '';
    const triggers = search
      ? mockTriggerCatalog.filter(
          (trigger) => trigger.name.toLowerCase().includes(search) || trigger.slug.toLowerCase().includes(search),
        )
      : mockTriggerCatalog;
    return HttpResponse.json({ triggers });
  }),

  http.get(`${backendUrl}/playbooks/:id/runs`, async ({ request, params }) => {
    const unauthorized = requireBearer(request);
    if (unauthorized) return unauthorized;
    const playbook = await findLivePlaybook(params.id as string);
    if (!playbook) return HttpResponse.json({ message: 'Not found' }, { status: 404 });

    let runs = await getRunsForPlaybook(playbook.id);
    if (!runs) {
      runs = buildSeedRuns(playbook);
      await setRunsForPlaybook(playbook.id, runs);
    }
    return HttpResponse.json({ runs: [...runs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  }),

  http.get(`${backendUrl}/playbooks/:id/runs/:runId`, async ({ request, params }) => {
    const unauthorized = requireBearer(request);
    if (unauthorized) return unauthorized;
    const playbook = await findLivePlaybook(params.id as string);
    if (!playbook) return HttpResponse.json({ message: 'Not found' }, { status: 404 });

    const runs = (await getRunsForPlaybook(playbook.id)) ?? [];
    const run = runs.find((r) => r.id === params.runId);
    if (!run) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ run });
  }),
];
