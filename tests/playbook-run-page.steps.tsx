// Provided acceptance suite — do not modify.
// Executes docs/features/playbook-run-page.feature against your page.
import { defineFeature, loadFeature } from 'jest-cucumber';
import { http, HttpResponse } from 'msw';
import { beforeEach, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { backendUrl } from '@/base/config';
import { server } from '@/base/test/server';
import { fakeIdToken } from '@/base/test/fakeIdToken';
import type { StoredTokens } from '@/components/auth/tokenStorage';
import type { PlaybookRun } from '@/interfaces/playbook';
import PlaybookRunPage from '../src/components/playbook/pages/PlaybookRunPage';

const feature = loadFeature('docs/features/playbook-run-page.feature');

function makeRun(overrides: Partial<PlaybookRun> = {}): PlaybookRun {
  return {
    id: 'r1',
    playbookId: 't1',
    userId: 'mock-user-123',
    triggerSlug: 'GMAIL_NEW_GMAIL_MESSAGE',
    toolkitSlug: 'gmail',
    webhookEventId: 'evt-1',
    triggerPayload: { subject: 'hello' },
    model: 'claude-haiku-4-5-20251001',
    status: 'completed',
    gateReasoning: 'Message matches the trigger — proceeding.',
    response: 'Drafted a reply and flagged two follow-up items.',
    toolCalls: [
      {
        name: 'GMAIL_SEND_EMAIL',
        input: { to: 'finance@example.com', subject: 'Re: Q3 budget review' },
        output: { messageId: 'mock-message-id-1', status: 'sent' },
      },
    ],
    createdAt: '2026-07-01T00:00:00.000Z',
    completedAt: '2026-07-01T00:01:00.000Z',
    ...overrides,
  };
}

function signedInUser(): StoredTokens {
  return {
    idToken: fakeIdToken({ name: 'Jane Doe' }),
    accessToken: 'access-token',
    expiresAt: Date.now() + 60_000,
  };
}

function renderRunPage(user: StoredTokens | null, playbookId: string, runId: string) {
  render(
    <MemoryRouter initialEntries={[`/playbooks/${playbookId}/runs/${runId}`]}>
      <Routes>
        <Route path="/playbooks/:id/runs/:runId" element={<PlaybookRunPage user={user} />} />
        <Route path="/playbooks/:id" element={<div>playbook-detail-marker</div>} />
        <Route path="/login" element={<div>login-marker</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function serveRun(playbookId: string, runId: string, run: PlaybookRun) {
  server.use(http.get(`${backendUrl}/playbooks/${playbookId}/runs/${runId}`, () => HttpResponse.json({ run })));
}

const ctx: { run: PlaybookRun } = { run: makeRun() };
let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  ctx.run = makeRun();
  user = userEvent.setup();
});

defineFeature(feature, (test) => {
  test('It redirects to login when there is no signed-in user', ({ when, then }) => {
    when(/^the run page is opened for playbook "([^"]*)" run "([^"]*)" with no signed-in user$/, (playbookId, runId) => {
      renderRunPage(null, playbookId, runId);
    });
    then('the login screen is shown', () => {
      expect(screen.getByText('login-marker')).toBeInTheDocument();
    });
  });

  test('A completed run renders its status, gate reasoning, and response', ({ given, when, then, and }) => {
    given(/^a completed run "([^"]*)" of playbook "([^"]*)"$/, (runId, playbookId) => {
      ctx.run = makeRun({ id: runId, playbookId, status: 'completed' });
      serveRun(playbookId, runId, ctx.run);
    });
    when(/^the run page is opened for playbook "([^"]*)" run "([^"]*)"$/, (playbookId, runId) => {
      renderRunPage(signedInUser(), playbookId, runId);
    });
    then(/^the status "([^"]*)" is shown$/, async (label) => {
      expect(await screen.findByText(label, { selector: 'span' })).toBeInTheDocument();
    });
    and('the gate reasoning is shown', () => {
      expect(screen.getByText(ctx.run.gateReasoning!)).toBeInTheDocument();
    });
    and('the response is shown', () => {
      expect(screen.getByText(ctx.run.response!)).toBeInTheDocument();
    });
    and('no error section is shown', () => {
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });
  });

  test('A completed run expands a tool call to reveal its output', ({ given, when, and, then }) => {
    given(/^a completed run "([^"]*)" of playbook "([^"]*)"$/, (runId, playbookId) => {
      ctx.run = makeRun({ id: runId, playbookId, status: 'completed' });
      serveRun(playbookId, runId, ctx.run);
    });
    when(/^the run page is opened for playbook "([^"]*)" run "([^"]*)"$/, (playbookId, runId) => {
      renderRunPage(signedInUser(), playbookId, runId);
    });
    and('the run has loaded', async () => {
      await screen.findByRole('button', { name: ctx.run.toolCalls[0].name });
    });
    then('the tool call output is hidden until expanded', () => {
      expect(screen.queryByText(/mock-message-id-1/)).not.toBeInTheDocument();
    });
    and('expanding the tool call reveals its output', async () => {
      await user.click(screen.getByRole('button', { name: ctx.run.toolCalls[0].name }));
      expect(screen.getByText(/mock-message-id-1/)).toBeInTheDocument();
    });
  });

  test('A failed run shows its error and its gate reasoning', ({ given, when, then, and }) => {
    given(/^a failed run "([^"]*)" of playbook "([^"]*)"$/, (runId, playbookId) => {
      ctx.run = makeRun({
        id: runId,
        playbookId,
        status: 'failed',
        response: undefined,
        toolCalls: [],
        error: 'Composio tool call GMAIL_SEND_EMAIL failed: connected account token expired.',
      });
      serveRun(playbookId, runId, ctx.run);
    });
    when(/^the run page is opened for playbook "([^"]*)" run "([^"]*)"$/, (playbookId, runId) => {
      renderRunPage(signedInUser(), playbookId, runId);
    });
    then(/^the status "([^"]*)" is shown$/, async (label) => {
      expect(await screen.findByText(label, { selector: 'span' })).toBeInTheDocument();
    });
    and('the error message is shown', () => {
      expect(screen.getByText(ctx.run.error!)).toBeInTheDocument();
    });
    and('the gate reasoning is shown', () => {
      expect(screen.getByText(ctx.run.gateReasoning!)).toBeInTheDocument();
    });
  });

  test('A running run shows the evaluating gate fallback', ({ given, when, then, and }) => {
    given(/^a running run "([^"]*)" of playbook "([^"]*)"$/, (runId, playbookId) => {
      ctx.run = makeRun({
        id: runId,
        playbookId,
        status: 'running',
        gateReasoning: undefined,
        response: undefined,
        toolCalls: [],
        completedAt: undefined,
      });
      serveRun(playbookId, runId, ctx.run);
    });
    when(/^the run page is opened for playbook "([^"]*)" run "([^"]*)"$/, (playbookId, runId) => {
      renderRunPage(signedInUser(), playbookId, runId);
    });
    then(/^the status "([^"]*)" is shown$/, async (label) => {
      expect(await screen.findByText(label, { selector: 'span' })).toBeInTheDocument();
    });
    and(/^the gate reasoning fallback "([^"]*)" is shown$/, (fallback) => {
      expect(screen.getByText(fallback)).toBeInTheDocument();
    });
  });

  test('It shows an error state when the run cannot be loaded', ({ given, when, then }) => {
    given(/^the run "([^"]*)" of playbook "([^"]*)" cannot be loaded$/, (runId, playbookId) => {
      server.use(
        http.get(`${backendUrl}/playbooks/${playbookId}/runs/${runId}`, () =>
          HttpResponse.json({ message: 'Not found' }, { status: 404 }),
        ),
      );
    });
    when(/^the run page is opened for playbook "([^"]*)" run "([^"]*)"$/, (playbookId, runId) => {
      renderRunPage(signedInUser(), playbookId, runId);
    });
    then(/^the load error "([^"]*)" is shown$/, async (message) => {
      expect(await screen.findByText(message)).toBeInTheDocument();
    });
  });
});
