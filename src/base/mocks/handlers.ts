// PROVIDED — do not modify.
// The msw request handlers backing both the browser worker (dev) and the node server
// (tests). Trimmed to the surface this sandbox exercises: a /health probe plus the
// playbook run handlers from src/components/playbook/mocks.ts.
import { http, HttpResponse } from 'msw';
import { backendUrl } from '@/base/config';
import { playbookHandlers } from '@/components/playbook/mocks';

// Mirrors the response shape of playbook-backend's src/base/handlers/health.ts.
const baseHandlers = [
  http.get(`${backendUrl}/health`, () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),
];

export const handlers = [...baseHandlers, ...playbookHandlers];
