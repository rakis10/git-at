# Dev-Command Center — Roadmap

Stav k 2026-06-16. MVP nasadený na Render (Turso DB, GitHub sync, ADMIN_TOKEN auth).

## Hotové (MVP)
- ✅ Drizzle schéma (projects, roadmap_items, weekly_changelogs) na Turso
- ✅ Dashboard — roadmap tabuľka so statusom a % progresu
- ✅ Blocked/roadblock workflow
- ✅ Fetch GitHub & Sync (commity za 7 dní)
- ✅ ADMIN_TOKEN auth (httpOnly cookie)
- ✅ Render deploy (render.yaml, Node pin)

## Tento týždeň

| P | Feature | Stav |
|---|---|---|
| P0 | **Project CRUD UI** — pridať/editovať/zmazať projekt z dashboardu | 🔨 in progress |
| P0 | **AI Weekly Changelog** — commity + roadmap → Nemotron 3 Ultra (NVIDIA) → markdown do `weekly_changelogs` | 🔨 in progress |
| P1 | **Roadmap item edit + delete** | ✅ done |
| P1 | **Changelog história + export (.md / copy)** | ✅ done |
| P2 | **Persist synced commits (commits tabuľka)** | ✅ done |
| P2 | **Auth gate cez Proxy (Next 16, býv. middleware)** | ✅ done |
| P2 | **Per-projekt filter, progress rollup, loading/error UX** | ✅ done |

## Mimo scope (zatiaľ)
Multi-user auth, GitHub webhooky, pagination commitov nad 100, real-time updates.

## Náklady
- Infra: $0/mes (Render Free + Turso Free + GitHub PAT)
- AI changelog: Nemotron 3 Ultra cez NVIDIA `integrate.api.nvidia.com` (free dev tier / podľa NVIDIA kreditov)
