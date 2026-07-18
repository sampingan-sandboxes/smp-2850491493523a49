// Provided acceptance suite — do not modify.
// Executes docs/features/playbook-api.feature against your implementation.
import { defineFeature, loadFeature } from 'jest-cucumber';
import { http, HttpResponse } from 'msw';
import { beforeEach, expect } from 'vitest';
import { backendUrl } from '@/base/config';
import { server } from '@/base/test/server';
import type { PlaybookTrigger } from '@/interfaces/playbook-config';
import type { PlaybookRun, PlaybookRunStatus } from '@/interfaces/playbook';
import { searchTriggers } from '../src/components/playbook/triggers';
import { getPlaybookRun, listPlaybookRuns } from '../src/components/playbook/playbookRuns';
import { PLAYBOOK_RUN_STATUS_META } from '../src/components/playbook/runStatus';

const feature = loadFeature('docs/features/playbook-api.feature');

function makeRun(overrides: Partial<PlaybookRun> = {}): PlaybookRun {
  return {
    id: 'run-1',
    playbookId: 'playbook-1',
    userId: 'user-1',
    triggerSlug: 'GMAIL_NEW_GMAIL_MESSAGE',
    toolkitSlug: 'gmail',
    webhookEventId: 'evt-1',
    triggerPayload: { subject: 'hello' },
    model: 'claude-haiku-4-5-20251001',
    status: 'completed',
    gateReasoning: 'Matches the trigger — proceeding.',
    response: 'Done.',
    toolCalls: [],
    createdAt: '2026-07-01T00:00:00.000Z',
    completedAt: '2026-07-01T00:01:00.000Z',
    ...overrides,
  };
}

const ctx: {
  triggers: PlaybookTrigger[];
  runs: PlaybookRun[];
  run: PlaybookRun | null;
  error: unknown;
  receivedAuth: string | null;
  receivedMethod: string;
  receivedSearch: string | null;
  meta: { label: string; textClassName: string; dotClassName: string } | undefined;
} = {
  triggers: [],
  runs: [],
  run: null,
  error: null,
  receivedAuth: null,
  receivedMethod: '',
  receivedSearch: null,
  meta: undefined,
};

beforeEach(() => {
  ctx.triggers = [];
  ctx.runs = [];
  ctx.run = null;
  ctx.error = null;
  ctx.receivedAuth = null;
  ctx.receivedMethod = '';
  ctx.receivedSearch = null;
  ctx.meta = undefined;
});

defineFeature(feature, (test) => {
  test('Searching triggers returns the matching catalog entries', ({ given, when, then }) => {
    given(/^the triggers endpoint will return a "([^"]*)" trigger for search "([^"]*)"$/, (name, search) => {
      server.use(
        http.get(`${backendUrl}/triggers`, ({ request }) => {
          const s = new URL(request.url).searchParams.get('search');
          if (s === search) {
            return HttpResponse.json({ triggers: [{ slug: 'GMAIL_NEW_GMAIL_MESSAGE', toolkit: 'gmail', name }] });
          }
          return HttpResponse.json({ triggers: [] });
        }),
      );
    });
    when(/^triggers are searched for "([^"]*)"$/, async (query) => {
      ctx.triggers = await searchTriggers('a-valid-access-token', query);
    });
    then(/^the returned triggers include "([^"]*)"$/, (name) => {
      expect(ctx.triggers.map((t) => t.name)).toContain(name);
    });
  });

  test('Searching triggers sends the token as a Bearer credential and an explicit search param', ({
    when,
    then,
    and,
  }) => {
    when(/^triggers are searched for "([^"]*)" with token "([^"]*)"$/, async (query, token) => {
      server.use(
        http.get(`${backendUrl}/triggers`, ({ request }) => {
          ctx.receivedAuth = request.headers.get('authorization');
          ctx.receivedSearch = new URL(request.url).searchParams.get('search');
          return HttpResponse.json({ triggers: [] });
        }),
      );
      ctx.triggers = await searchTriggers(token, query);
    });
    then(/^the triggers request carried authorization "([^"]*)"$/, (auth) => {
      expect(ctx.receivedAuth).toBe(auth);
    });
    and(/^the triggers request search param was "([^"]*)"$/, (search) => {
      expect(ctx.receivedSearch).toBe(search);
    });
  });

  test('Searching triggers throws when the backend fails', ({ given, when, then }) => {
    given(/^the triggers endpoint will fail with status (\d+)$/, (status) => {
      server.use(http.get(`${backendUrl}/triggers`, () => HttpResponse.text('down', { status: Number(status) })));
    });
    when(/^searching triggers is attempted for "([^"]*)"$/, async (query) => {
      try {
        await searchTriggers('a-valid-access-token', query);
      } catch (e) {
        ctx.error = e;
      }
    });
    then(/^searching triggers is rejected with "([^"]*)"$/, (message) => {
      expect((ctx.error as Error).message).toBe(message);
    });
  });

  test("Listing runs returns the playbook's runs", ({ given, when, then }) => {
    given(/^the runs endpoint for playbook "([^"]*)" will return one run$/, (playbookId) => {
      server.use(http.get(`${backendUrl}/playbooks/${playbookId}/runs`, () => HttpResponse.json({ runs: [makeRun()] })));
    });
    when(/^runs are listed for playbook "([^"]*)"$/, async (playbookId) => {
      ctx.runs = await listPlaybookRuns('a-valid-access-token', playbookId);
    });
    then(/^one run is returned$/, () => {
      expect(ctx.runs).toHaveLength(1);
    });
  });

  test('Listing runs sends a GET with the Bearer token', ({ when, then, and }) => {
    when(/^runs are listed for playbook "([^"]*)" with token "([^"]*)"$/, async (playbookId, token) => {
      server.use(
        http.get(`${backendUrl}/playbooks/${playbookId}/runs`, ({ request }) => {
          ctx.receivedAuth = request.headers.get('authorization');
          ctx.receivedMethod = request.method;
          return HttpResponse.json({ runs: [] });
        }),
      );
      ctx.runs = await listPlaybookRuns(token, playbookId);
    });
    then(/^the runs request carried authorization "([^"]*)"$/, (auth) => {
      expect(ctx.receivedAuth).toBe(auth);
    });
    and(/^the runs request method was "([^"]*)"$/, (method) => {
      expect(ctx.receivedMethod).toBe(method);
    });
  });

  test('Listing runs throws when the backend fails', ({ given, when, then }) => {
    given(/^the runs endpoint for playbook "([^"]*)" will fail with status (\d+)$/, (playbookId, status) => {
      server.use(
        http.get(`${backendUrl}/playbooks/${playbookId}/runs`, () => HttpResponse.text('down', { status: Number(status) })),
      );
    });
    when(/^listing runs is attempted for playbook "([^"]*)"$/, async (playbookId) => {
      try {
        await listPlaybookRuns('a-valid-access-token', playbookId);
      } catch (e) {
        ctx.error = e;
      }
    });
    then(/^listing runs is rejected with "([^"]*)"$/, (message) => {
      expect((ctx.error as Error).message).toBe(message);
    });
  });

  test('Fetching a single run returns it', ({ given, when, then }) => {
    given(/^the run endpoint for playbook "([^"]*)" run "([^"]*)" will return that run$/, (playbookId, runId) => {
      server.use(
        http.get(`${backendUrl}/playbooks/${playbookId}/runs/${runId}`, () =>
          HttpResponse.json({ run: makeRun({ id: runId }) }),
        ),
      );
    });
    when(/^run "([^"]*)" of playbook "([^"]*)" is fetched$/, async (runId, playbookId) => {
      ctx.run = await getPlaybookRun('a-valid-access-token', playbookId, runId);
    });
    then(/^the fetched run has id "([^"]*)"$/, (runId) => {
      expect(ctx.run?.id).toBe(runId);
    });
  });

  test('Fetching a single run throws when it is missing', ({ given, when, then }) => {
    given(/^the run endpoint for playbook "([^"]*)" run "([^"]*)" will fail with status (\d+)$/, (playbookId, runId, status) => {
      server.use(
        http.get(`${backendUrl}/playbooks/${playbookId}/runs/${runId}`, () =>
          HttpResponse.json({ message: 'Not found' }, { status: Number(status) }),
        ),
      );
    });
    when(/^fetching run "([^"]*)" of playbook "([^"]*)" is attempted$/, async (runId, playbookId) => {
      try {
        await getPlaybookRun('a-valid-access-token', playbookId, runId);
      } catch (e) {
        ctx.error = e;
      }
    });
    then(/^fetching the run is rejected with "([^"]*)"$/, (message) => {
      expect((ctx.error as Error).message).toBe(message);
    });
  });

  test('Run status maps to display metadata', ({ when, then, and }) => {
    when(/^the display metadata for status "([^"]*)" is read$/, (status) => {
      ctx.meta = PLAYBOOK_RUN_STATUS_META[status as PlaybookRunStatus];
    });
    then(/^its label is "([^"]*)"$/, (label) => {
      expect(ctx.meta?.label).toBe(label);
    });
    and(/^its text class is "([^"]*)"$/, (textClass) => {
      expect(ctx.meta?.textClassName).toBe(textClass);
    });
    and(/^its dot class is "([^"]*)"$/, (dotClass) => {
      expect(ctx.meta?.dotClassName).toBe(dotClass);
    });
  });
});
