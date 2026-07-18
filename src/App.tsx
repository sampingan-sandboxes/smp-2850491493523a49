// Provided dev harness — do not modify.
//
// A minimal router that wires up the playbook run detail page so `npm run dev` boots. The real
// app has many more routes; here a fixed fake session is injected and an index page links to
// an example run. With VITE_ENABLE_MOCKS=true the msw worker (src/components/playbook/mocks.ts)
// serves run data. Note a run only resolves once its parent playbook has been created through
// the mock backend, so a fresh session shows the page's "Failed to load run" state until
// then — the acceptance suites drive the fully-populated run states directly.
import { Link, Route, Routes } from 'react-router-dom';
import type { StoredTokens } from '@/components/auth/tokenStorage';
import PlaybookRunPage from '@/components/playbook/pages/PlaybookRunPage';

// A throwaway signed-in session for the harness. The id token is an unsigned, base64url
// payload that Header/decodeIdToken can read — it is NOT a real credential.
function fakeToken(claims: object): string {
  const enc = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${enc({ alg: 'none' })}.${enc(claims)}.sig`;
}

const devUser: StoredTokens = {
  idToken: fakeToken({ name: 'Jane Doe', email: 'jane.doe@example.com' }),
  accessToken: 'dev-access-token',
  expiresAt: Date.now() + 3600_000,
};

function DevIndex() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Playbook — Run History Sandbox</h1>
      <p>Dev harness. Open an example run detail page:</p>
      <p>
        <Link to="/playbooks/playbook-1/runs/run-1">/playbooks/playbook-1/runs/run-1</Link>
      </p>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<DevIndex />} />
      <Route path="/playbooks/:id/runs/:runId" element={<PlaybookRunPage user={devUser} />} />
      <Route path="/login" element={<DevIndex />} />
    </Routes>
  );
}

export default App;
