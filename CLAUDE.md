# Grid Iron - Fantasy Football App
Fantasy draft application featuring real-time Sleeper API integration and Supabase persistence.

## Project Overview
- **Live URL:** https://gridironapp.vercel.app
- **GitHub:** github.com/mickylakes/gridironapp
- **Stack:** Next.js 16 (App Router), Supabase, Vercel, Tailwind CSS, Sentry.

## Development Commands
- `npm run dev` - Start local development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks
- `npm run fetch-stats` - Re-fetch historical weekly stats + schedule (run once per year after season ends)

## Code Style & Architecture
- **Components:** Functional components with Hooks. Use `'use client'` strictly when needed.
- **Styling:** Tailwind CSS + `src/constants/theme.js` (DARK/LIGHT/AMOLED). Never hardcode hex values — always reference theme constants.
- **Icons:** Lucide-React.
- **Responsiveness:** Use `src/hooks/useWindowSize.js` for mobile-specific logic. All UI must be mobile-first.
- **Data Fetching:** Sleeper API for player stats; Supabase for user data (profiles, favorites, drafts, contracts, bug_reports).
- **Error Handling:** Every Supabase call and API fetch must have try/catch with console.error logging.

## File Structure
    src/app/page.js — landing page
    src/app/draft/page.js — main app (all primary state lives here)
    src/app/auth/callback/route.js — Supabase auth callback
    src/components/RankingsTab.jsx — player rankings table with cap value column
    src/components/DraftBoard.jsx — snake/linear/auction draft board
    src/components/PlayerModal.jsx — 3-tab player detail modal (Overview, History, Status)
    src/components/SettingsModal.jsx — league settings (budget, teams, scoring)
    src/components/AuthModal.jsx — email + Google OAuth
    src/components/CapSheetTab.jsx — NFL-style salary cap sheet with contracts
    src/components/BugReportModal.jsx — bug reporting modal with screenshot capture
    src/constants/theme.js — DARK, LIGHT, AMOLED, PC (position colors), TIERS
    src/utils/players.js — buildPlayers, blendStats, calcIdpPoints, capSalaryValue, capSalaryValueDynasty
    src/utils/tank01.js — Tank01 NFL API helpers: getAdp, getNews, getByeWeeks, getPlayerInfo, getProjections (server-only, cached in api_cache)
    src/utils/styleHelpers.js — style functions
    src/hooks/useWindowSize.js — mobile detection
    src/hooks/useSupabaseUser.js — getSession + onAuthStateChange subscription; returns { user, session, loading, error }
    src/hooks/useUserSettings.js — user_settings load + upsert; returns { settings, setSettings, loading, saving, error, reload, save }
    src/hooks/useDraftPersistence.js — drafts table load + upsert; returns { loadDraft, saveDraft, loading, saving, error }
    src/hooks/useFavorites.js — favorites table load + toggle; returns { favorites, setFavorites, loadFavorites, toggleFavorite, loading, saving, error }
    src/lib/supabase.js — Supabase client
    src/app/api/tank01/route.js — API route proxying Tank01 calls: GET ?type=adp|news|bye|playerinfo|projections
    scripts/fetchWeeklyStats.js — one-time script to pre-fetch historical weekly stats + ESPN schedule → public/data/
    public/data/weeklyStats_{year}.json — static pre-built game log data (2021–2025), committed to repo
    src/instrumentation.js — Sentry server + edge bootstrapping
    sentry.client.config.js — Sentry client SDK init (root)
    sentry.server.config.js — Sentry server SDK init (root)
    sentry.edge.config.js — Sentry edge SDK init (root)
    next.config.mjs — Next.js config: Sentry webpack plugin + CSP/security headers

## Supabase Schema Reference
- `profiles`: User profile and metadata.
- `favorites`: User-starred players. Columns: user_id, player_id.
- `drafts`: Saved draft states. UNIQUE constraint on user_id (one draft per user). Columns: user_id, name, draft_type, teams, rounds, your_slot, picks (JSONB), auction_bids (JSONB), settings (JSONB).
- `user_settings`: Scoring preferences and UI settings. Columns: user_id, theme, scoring, budget, num_teams, cap_ceiling, cap_teams, cap_team_names (JSONB).
- `contracts`: NFL-style cap contracts. Columns: user_id, player_id (TEXT), player_name, player_position, player_team, team_slot (INT), team_name, salary (INT, dollars), years, years_remaining, is_cut (BOOL). FK references auth.users directly. RLS enabled.
- `bug_reports`: User-submitted bug reports. Columns: id, user_id, user_email, category, description, screenshot_url, sentry_event_id, metadata (JSONB), status (TEXT: open/in_progress/resolved/wontfix), created_at. RLS enabled — anyone can insert, users can read own.
- `api_cache`: Server-side cache for Tank01 API responses. Columns: key (TEXT PK), data (JSONB), updated_at (TIMESTAMPTZ). RLS intentionally disabled — stores only public NFL data, no user info. To bust: `DELETE FROM api_cache WHERE key = 'adp';`

## Supabase Storage
- `bug-screenshots` bucket: Public bucket for bug report screenshot uploads. 5MB limit. Accepts image/png, image/jpeg, image/webp.

## Error Monitoring — Sentry
- DSN stored in NEXT_PUBLIC_SENTRY_DSN (client) and SENTRY_DSN (server) env vars.
- Automatic error capture via instrumentation.js + sentry.client.config.js.
- Session replay enabled (replaysOnErrorSampleRate: 1.0). `maskAllText: true`, `blockAllMedia: true` — replay cannot capture sensitive content.
- Manual bug reports in BugReportModal capture a Sentry event ID via captureMessage() and store it in bug_reports.sentry_event_id for correlation.
- To view reports: Sentry dashboard → Issues. Manual submissions: Supabase → bug_reports table.
- GitHub integration active: commit blame visible in Sentry issues.

## Security
- **CSP headers** set in `next.config.mjs` via `headers()` for all routes (`/:path*`). External allowlist: Supabase, Sentry, Sleeper, Google Fonts. `'unsafe-eval'` gated to `NODE_ENV === "development"` (Turbopack HMR only). `worker-src blob:` applies in ALL environments — Sentry session replay uses a blob web worker in production.
- **Other headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Tank01 API key** is server-side only — never exposed to the client. All Tank01 calls go through `/api/tank01`.
- **Secrets** are never committed — `.gitignore` covers `.env*`.

## Core Logic Rules
- **Player IDs:** Always treat Sleeper IDs as strings. Never compare with === to numbers.
- **Scoring:** Support PPR, Half-PPR, and Standard via `src/utils/players.js`. Scoring mode stored in user_settings.
- **State:** Sync draft progress to Supabase `drafts` table after every pick, undo, and reset.
- **Cap Salaries:** Use capSalaryValue(pts, pos, capCeiling) for redraft and capSalaryValueDynasty() for dynasty. Floor $750K, ceiling 35% of cap.
- **IDP Scoring:** calcIdpPoints() manually scores defensive players since Sleeper returns pts_ppr=0 for DEF/DL/LB/DB.
- **Settings upsert:** Managed by `useUserSettings` hook — upsert uses onConflict: "user_id". Call `save(patch)` with a partial object; hook adds user_id + updated_at automatically. DEFAULTS: `{ theme:"dark", scoring:"ppr", budget:200, num_teams:12, cap_ceiling:50_000_000 }`. Hook does NOT reset settings when user signs out.
- **Auth:** Managed by `useSupabaseUser` hook — single onAuthStateChange subscription. Never add a second one anywhere.
- **Draft persistence:** Managed by `useDraftPersistence` hook — `loadDraft()` returns raw DB row or null (caller applies state); `saveDraft(picks, bids, snapshot)` upserts. Neither function auto-runs — both called explicitly from `draft/page.js`'s `useEffect([user])` / action handlers. snapshot = `{ draftType, draftTeams, draftRounds, yourSlot, teamNames, idpOn, auctBudget }`.
- **Favorites:** Managed by `useFavorites` hook — state is `Set<string>` of player IDs. `toggleFavorite(id)` does optimistic update first, then guards `!user?.id` before DB write (UI toggles even when logged out). `loadFavorites()` called explicitly from `draft/page.js`. Passed as `favorites` + `toggleFav` props to `RankingsTab` and `PlayerModal`.
- **Tank01 data:** `buildPlayers()` accepts adpData, byeData, playerInfoData, tank01Proj as optional args. Tank01 injury/bye overrides Sleeper when available. All Tank01 data is empty in offseason — expected, no fix needed.
- **Tank01 injury field:** `p.injury` from Tank01 is an OBJECT `{designation, description, injDate, injReturnDate}`, not a string. Always use `typeof p.injury === "object" ? p.injury?.designation : p.injury` for injuryStatus.
- **Tank01 cache TTLs:** ADP 24h, News 2h, Bye 24h, PlayerInfo 6h, Projections 24h. Bust via Supabase SQL: `DELETE FROM api_cache WHERE key = '<key>';`

## Known Working Features
- Snake / linear / auction draft with Supabase persistence
- IDP toggle in draft + rankings
- Auth (email + Google OAuth)
- Favorites sync to Supabase
- Draft persistence + restore on login
- Dark / AMOLED / light theme (3-way cycle: Dark→AMOLED→Light, icons Moon/Zap/Sun, persisted to Supabase)
- PPR / Half-PPR / Standard scoring (persisted)
- Mobile responsive layout (tab bar, rankings sub-line stats, header overlap fixes)
- Player modal: Overview (stats + sparkline), History (bar chart + week-by-week game log with opponent logo, position-specific stat columns, PPR/STD toggle), Status (injury, depth, bio, bye week)
- Cap Sheet: contracts, per-team collapsible cards, live cap bars, league summary
- Cap salary recommendations in rankings table (desktop) and player modal (all sizes)
- Bug report modal: category picker, description, screen capture or file upload, device detection, Supabase + Sentry integration
- Sentry automatic error tracking with session replay (content masked)
- Tank01 NFL API: ADP, news, bye weeks, player info, projections — cached in Supabase, auto-populate in-season
- CSP + security headers on all routes

## Static Weekly Stats Data
- `public/data/weeklyStats_{year}.json` — pre-built per year, committed to repo, served as static assets by Vercel
- Structure: `{ players: { playerId: [{ week, stats }] }, schedule: { "1": { "BUF": "MIA", ... } } }`
- PlayerModal loads from static JSON first (zero external API calls). Falls back to live Sleeper API if file missing.
- Caching: `yearDataCache` (module-level, whole browser session) → component state → static file → Sleeper API
- Opponent logo (OPP column) in game log uses `schedule[week][player.team]` → Sleeper CDN logo URL
- ESPN team schedule API used by script: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{slug}/schedule?season={year}&seasontype=2`
- Team alias map in script handles ESPN vs Sleeper abbreviation differences (LAR→LA, WSH→WAS, etc.)
- **Annual maintenance:** run `npm run fetch-stats` each February after Super Bowl, commit updated JSON files
- Sleeper weekly stats confirmed: NO `opp`/`team` fields in stats objects — only raw stat numbers + scoring fields

## Future Opportunities
- Multiple saved drafts per user
- Depth charts (Tank01 endpoint, worth adding when season starts)
- Trade value calculator with cap implications
- Dead cap tracking
- Expiring contracts dashboard
- Franchise tag
- Weekly lineup optimizer
- Sleeper league import
- FA bidding board
- Cap projections (year-by-year)
- Feature request modal (separate from bug reports)
