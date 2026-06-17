# Dev-Command Center

AI Roadmap & Git Changelog Automator — interný admin nástroj. Next.js (App Router) + Turso (libsql/Drizzle) + GitHub API.

## Funkcie (MVP)

- **Dashboard** — zoznam roadmap úloh so statusom (`todo` / `in_progress` / `blocked` / `done`) a % progresu.
- **Roadblock workflow** — označ úlohu ako `blocked` a napíš konkrétny roadblock.
- **Fetch GitHub & Sync** — stiahne commity za posledných 7 dní pre repo projektu a zobrazí ich vedľa roadmapy.
- **Auth** — jednoduchý zdieľaný `ADMIN_TOKEN` (httpOnly cookie); chráni všetky write akcie.

## Lokálny setup

```bash
npm install
cp .env.example .env.local   # vyplň hodnoty (PowerShell: copy .env.example .env.local)
npm run db:push              # vytvorí tabuľky v Turso
npm run db:seed              # (voliteľné) 1 projekt + 3 ukážkové items
npm run dev                  # http://localhost:3000
```

### Env premenné (`.env.local`)

| Kľúč | Zdroj |
|---|---|
| `TURSO_DATABASE_URL` | `turso db show <db> --url` |
| `TURSO_AUTH_TOKEN` | `turso db tokens create <db>` |
| `GITHUB_TOKEN` | GitHub PAT, `repo` read scope |
| `ADMIN_TOKEN` | ľubovoľný silný string — zadáva sa na `/login` |

## Štruktúra

```
src/
├─ db/        schema.ts (3 tabuľky), index.ts (lazy libsql klient), seed.ts
├─ lib/       github.ts (fetchRecentCommits), auth.ts (requireAdmin)
└─ app/
   ├─ login/      ADMIN_TOKEN → cookie
   └─ dashboard/  page.tsx, actions.ts (Server Actions), _components/
```

Read: server components čítajú `db` priamo. Write: výhradne cez Server Actions v `dashboard/actions.ts`, každá volá `requireAdmin()`.

## Deploy na Render (Free tier)

1. Push repo na GitHub, v Render: **New → Web Service**, vyber repo.
2. Environment: **Node**. Build: `npm install && npm run build`. Start: `npm start`.
3. Pridaj env premenné (rovnaké 4 kľúče ako `.env.local`).
4. `output: 'standalone'` v `next.config.ts` znižuje veľkosť image.
5. Tabuľky v produkčnej Turso DB nasaď cez `npm run db:push` proti produkčnému `TURSO_DATABASE_URL`.

https://dev-command-center.onrender.com

> Free tier uspí službu po nečinnosti (cold start ~30s). Turso je externé — dáta persistujú nezávisle.

## Mimo scope (zatiaľ)

AI generovanie changelogu (tabuľka `weekly_changelogs` je pripravená), multi-user auth, GitHub webhooky, pagination commitov nad 100.
