// PROVIDED STUB — do not modify.
// The playbook run mocks attribute seeded runs to a fixed mock user; this provides that
// identity. In the real app the auth module owns this fixture.
import { http, HttpResponse } from 'msw';
import { backendUrl } from '@/base/config';
import { requireBearer } from '@/base/mocks/requireBearer';
import type { AuthenticatedUser } from '@/interfaces/auth';

export const mockUser: AuthenticatedUser = {
  sub: 'mock-user-123',
  email: 'jane.doe@example.com',
  emailVerified: true,
  name: 'Jane Doe',
  picture: 'https://i.pravatar.cc/150?u=mock-user-123',
};

// Mirrors the response shape of playbook-backend's src/auth/handlers/me.ts.
export const authHandlers = [
  http.get(`${backendUrl}/me`, ({ request }) => {
    return requireBearer(request) ?? HttpResponse.json({ user: mockUser });
  }),
];
