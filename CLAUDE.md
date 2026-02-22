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

## Code Style & Architecture
- **Components:** Functional components with Hooks. Use `'use client'` strictly when needed.
- **Styling:** Tailwind CSS + `src/constants/theme.js` (DARK/LIGHT). Never hardcode hex values — always reference theme constants.
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
    src/constants/theme.js — DARK, LIGHT, PC (position colors), TIERS
    src/utils/players.js — buildPlayers, blendStats, calcIdpPoints, capSalaryValue, capSalaryValueDynasty
    src/utils/styleHelpers.js — style functions
    src/hooks/useWindowSize.js — mobile detection
    src/lib/supabase.js — Supabase client
    src/instrumentation.js — Sentry server + edge bootstrapping
    sentry.client.config.js — Sentry client SDK init (root)
    sentry.server.config.js — Sentry server SDK init (root)
    sentry.edge.config.js — Sentry edge SDK init (root)
    next.config.mjs — Next.js config with Sentry webpack plugin

## Supabase Schema Reference
- `profiles`: User profile and metadata.
- `favorites`: User-starred players. Columns: user_id, player_id.
- `drafts`: Saved draft states. UNIQUE constraint on user_id (one draft per user). Columns: user_id, name, draft_type, teams, rounds, your_slot, picks (JSONB), auction_bids (JSONB), settings (JSONB).
- `user_settings`: Scoring preferences and UI settings. Columns: user_id, theme, scoring, budget, num_teams, cap_ceiling, cap_teams, cap_team_names (JSONB).
- `contracts`: NFL-style cap contracts. Columns: user_id, player_id (TEXT), player_name, player_position, player_team, team_slot (INT), team_name, salary (INT, dollars), years, years_remaining, is_cut (BOOL). FK references auth.users directly. RLS enabled.
- `bug_reports`: User-submitted bug reports. Columns: id, user_id, user_email, category, description, screenshot_url, sentry_event_id, metadata (JSONB), created_at. RLS enabled — anyone can insert, users can read own.

## Supabase Storage
- `bug-screenshots` bucket: Public bucket for bug report screenshot uploads. 5MB limit. Accepts image/png, image/jpeg, image/webp.

## Error Monitoring — Sentry
- DSN stored in NEXT_PUBLIC_SENTRY_DSN (client) and SENTRY_DSN (server) env vars.
- Automatic error capture via instrumentation.js + sentry.client.config.js.
- Session replay enabled (replaysOnErrorSampleRate: 1.0).
- Manual bug reports in BugReportModal capture a Sentry event ID via captureMessage() and store it in bug_reports.sentry_event_id for correlation.
- To view reports: Sentry dashboard → Issues. Manual submissions: Supabase → bug_reports table.

## Core Logic Rules
- **Player IDs:** Always treat Sleeper IDs as strings. Never compare with ===to numbers.
- **Scoring:** Support PPR, Half-PPR, and Standard via `src/utils/players.js`. Scoring mode stored in user_settings.
- **State:** Sync draft progress to Supabase `drafts` table after every pick, undo, and reset.
- **Cap Salaries:** Use capSalaryValue(pts, pos, capCeiling) for redraft and capSalaryValueDynasty() for dynasty. Floor $750K, ceiling 35% of cap.
- **IDP Scoring:** calcIdpPoints() manually scores defensive players since Sleeper returns pts_ppr=0 for DEF/DL/LB/DB.
- **Settings upsert:** user_settings uses onConflict: "user_id". Always pass full settings object to avoid partial overwrites.
- **Auth:** Single onAuthStateChange subscription in page.js. Never add a second one.

## Known Working Features
- Snake / linear / auction draft with Supabase persistence
- IDP toggle in draft + rankings
- Auth (email + Google OAuth)
- Favorites sync to Supabase
- Draft persistence + restore on login
- Dark / light theme (persisted)
- PPR / Half-PPR / Standard scoring (persisted)
- Mobile responsive layout
- Player modal: Overview (stats + sparkline), History (bar chart, PPR/STD toggle), Status (injury, depth, bio)
- Cap Sheet: contracts, per-team collapsible cards, live cap bars, league summary
- Cap salary recommendations in rankings table (desktop) and player modal (all sizes)
- Bug report modal: category picker, description, screen capture or file upload, Supabase + Sentry integration
- Sentry automatic error tracking with session replay

## Future Opportunities
- Multiple saved drafts per user
- ADP data integration
- Trade value calculator with cap implications
- Dead cap tracking
- Expiring contracts dashboard
- Franchise tag
- Weekly lineup optimizer
- Sleeper league import
- FA bidding board
- Cap projections (year-by-year)
