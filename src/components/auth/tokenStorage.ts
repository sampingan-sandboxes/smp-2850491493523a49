// PROVIDED STUB — do not modify.
// The session-token shape and sessionStorage helpers from the auth module. The run page
// takes a `user: StoredTokens | null` prop; provided so the playbook module has a stable
// session type to depend on.
export interface StoredTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

const STORAGE_KEY = 'app.auth.tokens';

export function saveTokens(tokens: StoredTokens): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function getTokens(): StoredTokens | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as StoredTokens;
}

export function clearTokens(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
