# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Multi-tenant SaaS for massage shops (multiple shops, multiple branches per shop). The repository README is in Thai; UI strings throughout the clients are Thai.

| Folder | What it is |
| --- | --- |
| `WebApi/MassagePlatform.WebApi` | ASP.NET Core Web API on .NET 10, EF Core + PostgreSQL (Npgsql), JWT auth |
| `WebApi/MassagePlatform.WebApi.Tests` | xUnit tests |
| `WebApi/GeneratePlatformPasswordHash` | Console tool that hashes the platform admin password for local config |
| `WebClient/` | Angular 22 shop front-of-house app (POS, booking, rooms, staff, customers, branches, users) |
| `AdminClient/` | Angular 22 platform-admin app (creates tenants and owner accounts) |
| `Massage Shop POS System/` | Separate Figma Make prototype (React 19 + Vite + Tailwind v4, pnpm). Has its own `CLAUDE.md`/`AGENTS.md`; not wired to the API |

`MassagePlatform.slnx` at the root contains the .NET projects.

## Commands

API (needs PostgreSQL running and the `massage_platform` catalog database created, e.g. `createdb -h localhost -U postgres massage_platform`):

```powershell
dotnet run --project WebApi\MassagePlatform.WebApi --urls "http://localhost:5080"
dotnet run --project WebApi\GeneratePlatformPasswordHash      # produce Platform:AdminPasswordHash
dotnet test MassagePlatform.slnx
dotnet test MassagePlatform.slnx --filter "FullyQualifiedName~StaffScheduleRulesTests"   # single test class
```

Angular clients (run from `WebClient/` or `AdminClient/`; dev server on 4200 proxies `/api` to `http://localhost:5080` via `proxy.conf.json`):

```powershell
npm install
npm start
npm run build
npm test -- --watch=false                      # Vitest via @angular/build:unit-test
npm test -- --watch=false --include src/app/massage-api.spec.ts   # single spec file
```

EF Core migrations — the design-time factories in `Data/DesignTimeDbContextFactories.cs` read connection strings from environment variables, not appsettings:

```powershell
$env:ConnectionStrings__Platform = "..."; dotnet ef migrations add <Name> --project WebApi\MassagePlatform.WebApi --context PlatformDbContext --output-dir Data/Migrations/Platform
$env:TenantDatabase__AdminConnectionString = "..."; dotnet ef migrations add <Name> --project WebApi\MassagePlatform.WebApi --context TenantDbContext --output-dir Data/Migrations/Tenant
```

## Configuration

`Program.cs` fails fast unless these are set: `ConnectionStrings:Platform`, `TenantDatabase:AdminConnectionString`, `Jwt:SigningKey` (≥ 32 UTF-8 bytes), `Jwt:Issuer`, `Jwt:Audience`, `Platform:AdminUsername`, `Platform:AdminPasswordHash`. Put local values only in `WebApi/MassagePlatform.WebApi/appsettings.Development.json` (git-ignored). Do not ask the user to paste connection strings, keys or hashes into chat. If porting config from the user's `web02` project: `ConnectionStrings:Catalog` → `ConnectionStrings:Platform` (but use the separate `massage_platform` DB, never `restaurantos_catalog`), `Tenancy:AdminConnection` → `TenantDatabase:AdminConnectionString`, and generate a new JWT signing key rather than reusing web02's dev key.

## Architecture

### Database-per-tenant

- **Platform catalog** (`PlatformDbContext`): tenants (slug → database name), platform credentials. Migrations in `Data/Migrations/Platform`.
- **Tenant databases** (`TenantDbContext`): one PostgreSQL database per shop holding branches, services, staff, rooms, customers, appointments, staff schedules, sales, users. Migrations in `Data/Migrations/Tenant`.
- `TenantProvisioner` creates a new tenant database and migrates it when the platform admin creates a shop.
- On startup, `Program.cs` migrates the catalog **and every active tenant database**, so a new tenant migration is applied to all shops at next API start.

### Request pipeline / tenant resolution

`UseAuthentication` → `TenantResolutionMiddleware` → `UseAuthorization`. For every route except `/api/platform`, `/api/health` and `/openapi`, the middleware requires an `X-Tenant` header (shop slug), looks up the active tenant in the catalog, rejects the request if the JWT's `tenant_id` claim doesn't match, then sets the scoped `TenantScope`. `TenantDbContext` is built from `TenantScope.DatabaseName`; resolving it before tenant resolution throws. Tenant controllers use `[Authorize(Roles = "Owner,Manager,Staff")]`; platform endpoints use the `PlatformAdmin` role.

Business rules enforced server-side (not just in the UI): no double-booking of a room or therapist, and appointments must fall entirely within the therapist's working hours (weekly shifts + per-date exceptions, see `Services/StaffScheduleRules.cs`) in the branch's time zone.

### WebClient

- **Shell + routed pages.** `app.ts`/`app.html` is the shell: tenant login, sidebar/topbar, branch picker dialog, and a `<router-outlet>` rendered only once `store.workspaceLoaded`. Each menu is a lazily loaded page in `pages/<name>/<name>.page.ts|html`; `app.routes.ts` tags each route with `data.section`, which the shell copies into `store.activeSection` on `ResolveEnd` (before the page activates). Adding a menu = `Section` type in `workspace.store.ts` + shell `sections` list + route + page.
- **`core/workspace.store.ts` (`WorkspaceStore`)** holds everything shared across pages: session/user/role, reference data (branches, services, staff, rooms, customers), `selectedBranchId`, the global `selectedDate`, the selected-date `appointments`, `busy`/`errorMessage`, and lookup helpers (`customerName()` etc.). Wrap async work in `store.run(...)` — it drives `busy`, maps HTTP errors to Thai messages, and triggers change detection. Pages own their section-specific state and reload it when `store.branchChanged` emits.
- **Zoneless change detection.** There is no zone.js; the shell registers its `ChangeDetectorRef` via `store.connectView`, and `store.run` calls it when async work settles. Mutate page state inside `run` (or synchronously in an event handler) or it won't render.
- **`core/pos-session.ts` (`PosSession`)** keeps the POS cart across navigation and carries a booking from the Booking page to POS for payment (`startCheckout`).
- `core/massage-api.ts` (`MassageApi`) is the API client: promise-based (`firstValueFrom`), stores tenant slug and access token in `sessionStorage` (`massage.tenant`, `massage.accessToken`) and attaches `X-Tenant` + `Authorization` headers on every call. The selected branch is persisted as `massage.branchId`. Models are in `core/models.ts`.
- **Styles.** `src/styles.scss` is global. `src/app/workspace.scss` is included by the shell and by every page/shared component via `styleUrl`, so its rules stay view-encapsulated (the specificity it relies on to override `styles.scss`). Pages use `:host { display: contents; }` so the host element doesn't affect layout. New components that render workspace markup must include `workspace.scss` too.

### AdminClient

Same single-component pattern: `src/app/app.ts` + `platform-api.ts`, talking to `/api/platform`.

## Repo hygiene

Root and per-app `*.stdout.log` / `*.stderr.log` files and `tmp-api-build/` (compiled DLLs) have been committed by accident in recent commits; don't add more, and don't treat them as source.
