// PROVIDED STUB — do not modify.
// In the real app this module owns the full Cognito PKCE auth flow. Here it is stubbed down
// to the single surface the playbook module touches: the Header's "Sign out" action. There is
// no real session in the sandbox, so signing out is a no-op.
export function signOut(): void {
  // no-op in the sandbox
}
