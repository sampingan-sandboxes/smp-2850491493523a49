// PROVIDED STUB — do not modify.
// A trimmed copy of the playbook-config module's msw mocks. The playbook run handlers look up
// the parent Playbook through findLivePlaybook so they 404 on missing/deleted playbooks the same
// way the real backend does. Only the pieces the playbook module depends on are provided.
import { http, HttpResponse } from 'msw';
import { backendUrl } from '@/base/config';
import { createIdbStore } from '@/base/lib/idbStore';
import { requireBearer } from '@/base/mocks/requireBearer';
import { mockUser } from '@/components/auth/mocks';
import type { Playbook } from '@/interfaces/playbook-config';

// IndexedDB-backed so state survives MSW service worker restarts in a real browser; falls
// back to in-memory under jsdom (the test suite), where IndexedDB is unavailable.
const playbooks = createIdbStore<Playbook[]>('msw-playbooks-mock', 'state', 'playbooks', []);

export async function resetPlaybooksMock(): Promise<void> {
  await playbooks.set([]);
}

// The mock counterpart of the backend's playbook-config repo reads: playbook/mocks.ts's runs
// handlers look up the parent Playbook through this.
export async function findLivePlaybook(id: string): Promise<Playbook | undefined> {
  const all = await playbooks.get();
  return all.find((t) => t.id === id && t.deletedAt === null);
}

// Mirrors the response shapes of playbook-backend's src/playbook-config/handlers/*.ts.
// Kept so a playbook can be created/looked up when driving the mock backend directly.
export const playbookConfigHandlers = [
  http.get(`${backendUrl}/playbooks`, async ({ request }) => {
    const unauthorized = requireBearer(request);
    if (unauthorized) return unauthorized;
    const all = await playbooks.get();
    return HttpResponse.json({
      playbooks: all.filter((t) => t.deletedAt === null).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  }),

  http.post(`${backendUrl}/playbooks`, async ({ request }) => {
    const unauthorized = requireBearer(request);
    if (unauthorized) return unauthorized;
    const now = new Date().toISOString();
    const playbook: Playbook = {
      id: crypto.randomUUID(),
      userId: mockUser.sub,
      title: 'Untitled Playbook',
      trigger: null,
      triggerInstanceId: null,
      triggerDescription: '',
      prompt: [],
      model: 'claude-haiku-4-5-20251001',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    const all = await playbooks.get();
    await playbooks.set([...all, playbook]);
    return HttpResponse.json({ playbook });
  }),

  http.get(`${backendUrl}/playbooks/:id`, async ({ request, params }) => {
    const unauthorized = requireBearer(request);
    if (unauthorized) return unauthorized;
    const playbook = await findLivePlaybook(params.id as string);
    if (!playbook) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ playbook });
  }),
];
