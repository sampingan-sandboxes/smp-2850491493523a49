// PROVIDED STUB — do not modify.
// Pure ID-token claim helpers from the auth module. The Header and the run page decode the
// signed-in user's token for display; provided in full so you can focus on the playbook module.
export interface IdTokenClaims {
  name?: string;
  email?: string;
  picture?: string;
}

export function decodeIdToken(idToken: string): IdTokenClaims {
  const payload = idToken.split('.')[1];
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = atob(base64);
  return JSON.parse(json) as IdTokenClaims;
}

export function initials(claims: IdTokenClaims): string {
  const source = claims.name ?? claims.email ?? '?';
  return source
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
