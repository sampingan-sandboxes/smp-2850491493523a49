# Project Brief — Frontend Playbook Run-History Module

This project is a self-contained slice of a production React SPA. The goal of this engagement is
to build its **playbook run-history** module: the trigger-search + run API clients, the shared
run-status metadata, the trigger combobox, and the run detail page.

## Scope of work

The skeleton files under `src/components/playbook/` (currently throwing `NotImplemented`):
`triggers.ts`, `playbookRuns.ts`, `runStatus.ts`, `components/TriggerCombobox.tsx`,
`pages/PlaybookRunPage.tsx`. The contract is documented in:

- [docs/requirements.md](docs/requirements.md) — context + functional requirements
- [docs/specifications.md](docs/specifications.md) — file map, endpoints, data shapes
- [docs/diagrams.md](docs/diagrams.md) — run-history flow + run-detail decision diagrams
- [docs/features/](docs/features/) — the executable acceptance scenarios (Gherkin)

Everything under `src/base/**` and `src/interfaces/**`, the provided `mocks.ts` files, the
cross-module `src/components/auth/**` + `src/components/playbook-config/mocks.ts` stubs, and the
dev harness (`App.tsx`, `main.tsx`) are **provided** — you import them but do not modify them.

## Getting started

```bash
npm install
npm test               # runs the acceptance suites (they fail until you implement)
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Boots the SPA (Vite). Set up `.env` first (copy `.env.example`); with `VITE_ENABLE_MOCKS=true` the msw worker serves the backend in-browser. |
| `npm test` | Runs all tests, including the jest-cucumber acceptance suites (Vitest + jsdom) |
| `npm run test:coverage` | Runs tests with coverage |
| `npm run lint` | oxlint — must pass |
| `npm run build` | `tsc -b && vite build` — must pass |

`.env.test` already provides safe values for the test run.

## How the tests work

- The acceptance suites live in `tests/`. `*.steps.ts` covers the
  pure/API layer (triggers, runs, status metadata) driving your clients against an msw server;
  `*.steps.tsx` renders your components with React Testing Library inside a `MemoryRouter`.
- The msw backend simulator (`src/components/playbook/mocks.ts`) is provided and shared by the
  test server and the dev worker.

## Definition of done

1. **All acceptance scenarios should pass.** The suites under
   `tests/` execute the Gherkin features in `docs/features/`.
   Please leave the feature files and the step definitions alone.
2. **Ship the module with its own tests too.** Add unit tests (`*.test.ts[x]`) alongside the
   acceptance suite and aim for solid coverage of the code you write — check it with
   `npm run test:coverage`.
3. **Keep the public surface and file paths exactly as given** — so the module plugs straight
   into the wider codebase.
4. **Please leave the provided files alone** — configs, docs, acceptance suites, `src/base/**`,
   `src/interfaces/**`, the `mocks.ts` files, the cross-module stubs, and the dev harness.
5. **No new runtime dependencies** unless there's a clear reason (note it in your handover). Test
   dev-dependencies are fine.
6. React component skeletons declare an explicit `: ReactElement` return type — keep it, or
   `tsc` will infer `void` and reject the component in `npm run build`.
7. `npm run lint` and `npm run build` should pass with zero errors.

## Delivery

Push to a repository and share access, or send the sandbox as a zip (without `node_modules/`),
including a short note on any decisions or trade-offs you made.
