# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Operational guide for AI agents working in this repo. Long-form human docs:
`CONTRIBUTING.md` (setup, testing philosophy) and `frontend/README.md`.
Read those before large changes. This file is the short, must-follow version.
For a deep navigation map (request lifecycle, cron-job table, symptom → file
index, layering rules), read `docs/architecture.md` on demand — do not guess
file locations when it can answer in one hop.

## itr-xray fork — read first
This repo is **itr-xray**, IT_RUNNER's rebranded fork of 3x-ui (base: upstream
`v3.11.0`, tag `upstream/v3.11.0`). Functionality is upstream's; the fork owns
branding, system names and release plumbing. `README.md` (Russian) holds the
full "было → стало" rename table — update it whenever you rename or keep
something. The owner communicates in Russian; commit messages here are Russian.
- Names: binary/CLI/service `itr-xray` (`itr-xray.sh`, `itr-xray.service.*`,
  `itr-xray.rc`), paths `/usr/local/itr-xray`, `/etc/itr-xray/itr-xray.db`,
  `/var/log/itr-xray`, fail2ban jail `itr-xray-ipl` + `itr-xray-ipl*.log`,
  session cookie `itr-xray`, Go module `github.com/lastresorter/itr-xray`.
  The DB file name comes from `internal/config/name`. Deliberately KEPT:
  `XUI_*` env vars, `window.X_UI_*`, internal shell vars (`xui_folder`),
  `mtg-multi` from `github.com/mhsanaei/mtg-multi`, `docs/` (upstream docs site).
- Branding layer: `frontend/src/components/brand/ItrLogo.tsx` (outlined SVG
  paths, variants `word` IT_RUNNER / `dash` IT-RUNNER / `itr` ITR — sidebar uses
  dash/itr), `AboutModal.tsx` (must keep the 3x-ui credit + GPL line),
  `frontend/src/styles/brand.css` (fonts, `--itr-*` vars), palette tokens in
  `frontend/src/hooks/useTheme.tsx` (ultra-dark is the default), icons in
  `frontend/public/icons/itr-xray*`, favicon links injected by
  `brandIconInjection` in `internal/web/controller/dist.go`. The heading font
  YFF Rare is a TRIAL build (`frontend/src/assets/fonts/`).
- Versioning is independent of upstream: `internal/config/version` (strict
  `X.Y.Z` — the update checker and `parseVersionParts` reject suffixes).
  `install.sh` refuses versions below `min_version="1.0.1"`.
- Releases: `release.yml` runs ONLY on `v*.*.*` tags or manual dispatch (private
  repo, Actions minutes), publishes non-prerelease assets
  `itr-xray-linux-<arch>.tar.gz` (+`.sha256`) for 7 arches + Windows zip. Do not
  re-add branch/PR triggers. Docker (`docker.yml`) and the install smoke test
  (`smoke.yml`) are manual-only; the installer's anonymous downloads only work
  once the repo is public. Pushing a tag or changing releases needs the owner's OK.
- Upstream merges: remote `upstream` has `tagOpt --no-tags`; fetch a release as
  `git fetch upstream refs/tags/vX.Y.Z:refs/tags/upstream/vX.Y.Z`, merge
  `upstream/vX.Y.Z`. Afterwards re-apply renames in new upstream code:
  `github.com/lastresorter/itr-xray` → `github.com/lastresorter/itr-xray`,
  `x-ui`/`3x-ui` in scripts/Go strings, `3x-ipl`/`3xipl` → `itr-xray-ipl`,
  `MHSanaei/3x-ui` release URLs → `lastresorter/itr-xray`; keep our
  `internal/config/version` and bump it.
- Local preview: `docker compose up -d --build` → http://localhost:2053
  (a fresh `db/` gets a random first user, printed once in `docker compose logs`).

## Stack
- Backend: Go 1.27 (`module github.com/lastresorter/itr-xray`), Gin, GORM.
  Runs Xray-core as a managed child process (`internal/xray/process.go`) and
  imports `github.com/xtls/xray-core` for config types + gRPC stats/handler/router
  API. MTProto inbounds run a second managed child — the `mtg-multi` binary
  (a multi-secret mtg fork — NOT a Go dependency; its prebuilt release binary is
  fetched at image/release build time by `DockerInit.sh` + `release.yml`,
  panel-side code in `internal/mtproto/`) — outside Xray, one process per inbound
  serving each
  client's FakeTLS secret via the fork's `[secrets]` section (plus per-client
  ad-tags via `[secret-ad-tags]` and per-client data quota / expiry via
  `[secret-limits]`, mapped from the client's `totalGB`/`expiryTime`). Client,
  ad-tag and quota/expiry edits are hot-applied through the fork's management API
  (`PUT /secrets`, bearer-token guarded) so connections survive; the manager
  falls back to a process restart on older binaries. A client's panel-side
  traffic reset also calls `POST /secrets/{name}/reset-quota` so a renewed client
  is not re-blocked by the sidecar's quota counter.
- Storage: SQLite by default (`/etc/itr-xray/itr-xray.db` on Linux; the executable dir on
  Windows), PostgreSQL optional (`XUI_DB_TYPE` / `XUI_DB_DSN`). The CGo SQLite
  driver (`mattn/go-sqlite3`) needs a C compiler — `CGO_ENABLED=0` builds fail.
- Frontend: React 19 + Ant Design 6 + Vite 8 + TypeScript in `frontend/`,
  built into `internal/web/dist/` (gitignored) and embedded via `embed.FS`.

## Repo map
- `main.go` — entry point + `itr-xray` CLI (run, migrate, migrate-db, encrypt-tokens, setting, cert).
- `internal/config/` — env parsing (XUI_DEBUG, XUI_LOG_LEVEL, XUI_LOG_FOLDER,
  XUI_BIN_FOLDER, XUI_SKIP_HSTS, XUI_PORT, XUI_DB_*).
- `internal/database/` + `internal/database/model/` — GORM schema (~24 models;
  Inbound, Client, Setting, User are the core), inbound Protocol enum,
  AutoMigrate + hand-written migrations in `db.go`.
- `internal/xray/` — Xray child-process lifecycle, config generation, gRPC API.
- `internal/xray/geodata/` — streaming geosite/geoip `.dat` reader (cached
  category index + paged entries) and `geosite:`/`geoip:`/`ext:` token parsing.
- `internal/mtproto/` — MTProto inbounds via the bundled `mtg-multi` binary.
- `internal/tuic/` — TUIC v5 inbounds: native in-process Go QUIC server (no sidecar), traffic journal.
- `internal/amneziawg/` — AmneziaWG protocol shape: instance/peer derivation
  from an inbound, 3.1 obfuscation param generation + validation, port-forward
  spec parsing.
- `internal/amneziawgnet/` — embedded AmneziaWG runtime: amneziawg-go device
  over a gVisor userspace netstack, per-inbound reconcile manager, TCP/UDP
  relay into a loopback per-peer-auth SOCKS5 Xray inbound, port-forward
  listeners, per-peer IPv6 egress aliases.
- `internal/amneziawgkern/` — opt-in Linux kernel AmneziaWG datapath (NAT-only).
- `internal/pia/` — PIA WireGuard protocol client (auth, signed server list, `/addKey`).
- `internal/sub/` — subscription server (raw / JSON / Clash).
- `internal/eventbus/` — in-process pub/sub (outbound/node health, xray.crash,
  cpu.high, memory.high, login.attempt).
- `internal/logger/`, `internal/util/` (link, crypto, sys, ldap, …),
  `internal/tunnelmonitor/` — shared infrastructure.
- `internal/web/` — Gin server (embeds `dist/` + `translation/`).
  - `controller/` — panel + REST API handlers; OpenAPI at /panel/api/openapi.json.
  - `service/` — business logic (InboundService, SettingService, XrayService,
    node sync); subpackages tgbot/, discord/, email/, outbound/, panel/, integration/.
  - `job/` — 19 cron jobs (traffic, fail2ban IP-limit, node heartbeat/sync, LDAP,
    CPU/memory watchdogs, …); full table in `docs/architecture.md` §5.4.
  - `middleware/`, `entity/`, `global/`, `session/` (CSRF), `network/`,
    `runtime/` (master/sub-node over mTLS), `websocket/`.
  - `locale/` + `translation/` — i18n, 13 embedded locale JSON files.
- `frontend/` — React + TS source (see `frontend/CLAUDE.md`).
- `tools/openapigen/` — Go generator that emits frontend types + Zod/JSON schemas
  into `frontend/src/generated/` from Go structs. The OpenAPI doc itself
  (`frontend/public/openapi.json`) is assembled from those + `endpoints.ts` by
  `frontend/scripts/build-openapi.mjs`.
- `docs/` — upstream 3x-ui Next.js/Fumadocs site (pnpm; its CI workflows were
  removed in this fork, not rebranded, outside `make verify`). Holds a THIRD independent implementation of
  link/subscription generation in `docs/lib/xray/` — check it whenever
  share-link or install-command output changes.

## Hard rules (non-negotiable)
- Fix size must match bug size. Find the root cause, then make the SMALLEST
  change that removes it — a one-line guard beats a new subsystem. A small bug
  does not earn new columns, jobs, abstractions, config knobs or helper layers.
  If a fix genuinely needs new architecture, say so and get agreement first;
  never ship it unasked next to the fix.
- Comments in committed Go/TS: 2 lines MAX per comment block. Make the name
  carry the meaning first and rename rather than annotate; spend the 2 lines on
  the *why* a name cannot hold — an invariant, an issue number, a non-obvious
  constraint. Exempt: `//go:build`, `//go:generate`, and other directives.
  HTML `<!-- -->` is fine. (A linter cannot enforce this — you must.)
- New `g.POST`/`g.GET` in `internal/web/controller/` REQUIRES a matching entry
  in `frontend/src/pages/api-docs/endpoints.ts`, then `make gen` (or
  `cd frontend && npm run gen`). Hand-maintained but pinned both ways by
  `TestRouteRegistryContract` (`internal/web/routes_contract_test.go`): a missing
  OR stale entry fails `make test-go`. Scope: `/panel/api/*` + a few session
  routes; sub-server routes are exempt.
- Response examples come from Go struct `example:` tags via `tools/openapigen` —
  never hand-write them. A new struct must be added to openapigen's `StructAllow`
  allowlist (`tools/openapigen/main.go`) or it is silently omitted from
  schemas/examples (and `build-openapi.mjs` then fails on the missing schema).
- A new or renamed endpoint has a FOURTH step nothing checks: copy
  `frontend/public/openapi.json` → `docs/public/openapi.json`, then
  `cd docs && pnpm gen:api` to refresh the MDX under
  `docs/content/docs/en/reference/api/`.
- A new English i18n key goes in EVERY locale JSON in `internal/web/translation/`
  (13 files; uk-UA was removed, sk-SK came from upstream) AND must be referenced from `frontend/src` or Go in the SAME commit —
  `frontend/src/test/i18n-dead-keys.test.ts` fails both ways. It is a frontend
  test, so run `npm test`, not just `make test-go`. At runtime the frontend falls
  back to en-US; Go (`internal/web/locale/`) returns "" for an unknown key.
- DB / model changes require a migration in `internal/database/db.go`.
- Every state-changing inbound/client op dispatches through `runtime.Runtime`
  (`internal/web/runtime/`) — never straight to `internal/xray/api.go`, never from
  a controller or cron job. A direct call passes every local test and silently
  breaks every multi-node deployment. Other layering rules: `docs/architecture.md` §8.
- Conventional commits: `type(area): short imperative summary`, then a body
  explaining the why. Types in use: `fix`, `feat`, `chore`, `refactor`, `perf`,
  `docs`, `style`.

## Go conventions
- Stdlib `testing` only (no testify). Table-driven, `t.Run` subtests,
  `t.Helper()` on helpers. Assert the exact value / typed error / emitted
  string, never just `err != nil`. Prefer real deps over mocks: throwaway DB via
  `dbtest.InitDB(t, filepath.Join(t.TempDir(), "itr-xray.db"))`
  (`internal/database/dbtest`: once-migrated template + `CloseDB` cleanup; keep
  `database.InitDB` for reopening a file or a hand-built legacy DB); `httptest` for HTTP. Code
  that resolves `config.GetDBPath()` (backup/import) expects `itr-xray.db`
  under `XUI_DB_FOLDER`, so name the fixture file accordingly there.
  `internal/sub`'s `initSubDB(t)` is the template.
- A test must fail without its fix. Write it, revert the fix, watch it go red,
  restore. A test that passes either way is worse than no test: it certifies
  nothing and then gets cited as proof the fix works.
- Test what can actually break. No test for a getter, a constant, a rename, a
  pure map lookup, or inputs the function can never receive. One real test that
  drives the bug through the actual code path beats five that restate the code.
- Code must pass `golangci-lint run` (gofumpt + goimports formatting): `make lint`.
- Postgres, xray-gRPC-e2e and scale tests `t.Skip` unless `XUI_TEST_PG_DSN`,
  `XUI_DB_TYPE`+`XUI_DB_DSN`, `XRAY_E2E_BINARY` or `XUI_SCALE_TEST` is set — a
  green `go test ./...` does not mean those paths ran.

## Frontend conventions (summary; full version in frontend/CLAUDE.md)
- Ant Design 6 only — no Tailwind/shadcn. Targeted tweaks, not rewrites.
- TS strict; `@typescript-eslint/no-explicit-any` is an error. Zod schemas in
  `src/schemas/` are the source of truth; infer types with `z.infer`, never
  hand-write. Do not edit `src/generated/`.
- Node 24 (`.nvmrc`) — `make gen` imports `.ts` directly and needs its type
  stripping; Node 22 dies with `ERR_UNKNOWN_FILE_EXTENSION`. `npm test` includes
  a headless-Chromium Storybook project, so run
  `npx playwright install --with-deps chromium` once or `make verify` fails.
- Editing `frontend/src` does NOT change what users see until the Vite build is
  regenerated into `internal/web/dist/`. In `XUI_DEBUG=true`, HTML is served from
  the frozen embedded FS but JS/CSS off disk — after `npm run build` you MUST
  restart `go run .` or you get a blank page with 404s.
- After touching share-link logic (`src/lib/xray/`), run `npm run test` (golden
  fixtures); regenerate snapshots (`npx vitest run -u`) only for intentional
  output changes, never to make a red test green.

## Build, test, verify
A fresh clone has no `internal/web/dist/`, so a bare `go build ./...` dies with
`pattern all:dist: no matching files found` while ~35 other packages pass — it
reads as a broken repo, not a missing step. Run `make dist-stub` once; every
`make` Go target already depends on it, which is why `make test-go` beats
`go test ./...`. Run `make help` for all targets. The local gate:

    make verify   # gen-check + lint + typecheck + test + build + build-storybook

That is the *fast* gate, not all of CI. `ci.yml` also runs `make race`,
`make vulncheck`, a live-Postgres job (where a SKIP counts as a failure) and a
30s fuzz smoke on `FuzzParseLink`/`FuzzDecodeCertPin` — run those locally when
you touch DB/dialect or parser code.

Common targets: `make gen` (regenerate Zod/OpenAPI), `make lint` (Go + frontend),
`make test` (Go `-shuffle=on` + frontend), `make race`, `make build`. See `Makefile`.

Single tests:

    go test ./internal/sub/ -run 'TestName/subtest' -count=1
    cd frontend && npx vitest run --project unit src/test/log-parse.test.ts

Vitest projects are `unit`, `components` and `storybook` (the last needs the
Playwright Chromium). golangci-lint must be built with Go ≥ the `go.mod`
version, or it refuses to load the config.

## Definition of done (before opening a PR)
1. `make verify` passes — its `gen-check` already runs `make gen` and fails on a
   dirty `frontend/src/generated` / `frontend/public/openapi.json`.
2. Diff is focused; refactors are separate from feature work.
