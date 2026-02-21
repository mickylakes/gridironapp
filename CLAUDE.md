# Grid Iron - Fantasy Football App
Fantasy draft application featuring real-time Sleeper API integration and Supabase persistence.

## Project Overview
- **Live URL:** https://gridironapp.vercel.app
- **GitHub:** github.com/mickylakes/gridironapp
- **Stack:** Next.js (App Router), Supabase, Vercel, Tailwind CSS.

## Development Commands
- `npm run dev` - Start local development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks

## Code Style & Architecture
- **Components:** Functional components with Hooks. Use `'use client'` strictly when needed.
- **Styling:** Tailwind CSS + `src/constants/theme.js` (DARK/LIGHT).
- **Icons:** Lucide-React.
- **Responsiveness:** Use `src/hooks/useWindowSize.js` for mobile-specific logic.
- **Data Fetching:** Sleeper API for player stats; Supabase for user data (profiles, favorites, drafts).
- **File Structure:**
    src/app/page.js — landing page

    src/app/draft/page.js — main app

    src/app/auth/callback/route.js — Supabase auth callback

    src/components/ — RankingsTab, DraftBoard, PlayerModal, SettingsModal, AuthModal

    src/constants/theme.js — DARK, LIGHT themes

    src/utils/players.js — buildPlayers, stats logic

    src/utils/styleHelpers.js — style functions

    src/hooks/useWindowSize.js — mobile detection

    src/lib/supabase.js — Supabase client
 
## Supabase Schema Reference
- `profiles`: User profile and metadata.
- `favorites`: User-starred players.
- `drafts`: Saved draft states and progress.
- `user_settings`: Scoring preferences and UI settings.

## Core Logic Rules
- **Player IDs:** Always treat Sleeper IDs as strings.
- **Scoring:** Support PPR, Half-PPR, and Standard via `src/utils/players.js`.
- **State:** Sync draft progress to Supabase `drafts` table frequently.