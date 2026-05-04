# 🪖 Military Helper
 
[![Deploy](https://img.shields.io/github/deployments/prigo929/Campus-Helper-Bolt/production?label=vercel&logo=vercel)](https://campus-helper-bolt.vercel.app)
![TypeScript](https://img.shields.io/badge/language-Typescript-blue?logo=typescript)
![Next.js](https://img.shields.io/badge/framework-Next.js-black?logo=next.js)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E?logo=supabase)

Military Helper is a full-stack, Desert Storm-inspired platform for crews to:

- Spin up and accept missions  
- Exchange supply and gear  
- Share field briefings and chatter  
- Coordinate with teammates in real time  
- Get help from an integrated **Military Helper AI**  

The base is still Next.js (App Router) + TypeScript + Supabase + Tailwind + shadcn/ui + Vercel, originally built as a campus tool and now re-skinned for military use. Legacy feature descriptions below still apply to the core functionality.

---

## ✨ Features

### Core Features

- **Authentication & Profiles**
  - Email / magic link (or password) login via Supabase Auth
  - Personnel profile: name, unit, rank/specialty, bio, avatar
  - Role support: `user` (default) and `admin` (for moderation)

- **Dashboard**
  - Authenticated home view after login
  - Quick access to Missions, Supply, Forum, Chat, Profile, AI Assistant
  - Snapshot of recent activity (latest missions/posts/messages/notifications)

- **Missions & Taskings (Jobs)**
  - Create mission/task:
    - title, description, category, estimated pay, optional location
  - Browse missions in a responsive card layout
  - Individual mission details:
    - full description, posted by, creation time
  - Sorting & basic filtering (e.g. by category, newest first)
  - Users can show interest/apply to missions

- **Supply & Gear Marketplace (Materials)**
  - Create listings for equipment, supplies, notes, or gear
  - Upload images via Supabase Storage
  - Supplies list view + detail view
  - Contact seller via messaging

- **Forum**
  - Categories (e.g. General, Jobs, Materials, Campus News)
  - Create posts (title + content)
  - Comment on posts
  - Sort by newest / recent activity

- **Messaging**
  - 1:1 conversations between personnel
  - Started from mission/supply pages or profile
  - Realtime-ish updates via Supabase Realtime

- **Reporting & Moderation**
  - Report missions, gear, posts, comments, or users
  - Admin reports panel:
    - see item, reporter, reason, timestamp
  - Admin actions:
    - mark as reviewed, delete content, optionally restrict users

---

### Advanced Features (Implemented)

- **Ratings & Reviews**
  - Rate users after a mission or transaction (e.g. when a mission is completed or gear is exchanged)
  - 1–5 star ratings with optional written review
  - Display average rating and reviews on user profiles
  - Ratings influence profile credibility across the app

- **In-App Notifications**
  - Notification system for:
    - new messages
    - interest/applications on your missions
    - comments on your forum posts
    - other relevant events
  - Notification dropdown in the UI
  - “Mark as read” functionality so users can clear notifications

- **Global Search**
  - Single search bar that can find:
    - missions
    - supply/gear
    - forum posts
  - Unified search results view, grouped by content type
  - Basic highlighting/structure so users understand where the match came from

- **AI Assistant – “Military Helper AI”**
  - Integrated AI assistant inside the app
  - Capabilities:
    - Suggesting missions or gear based on user interests / queries
    - Summarizing forum threads or long discussions
    - Summarizing intel / text the user pastes
    - Answering common operational questions (briefing tips, task ideas, etc.)
  - Implemented using **Next.js AI (Vercel AI SDK)** with pluggable LLM providers

---

## 🧱 Tech Stack (Current)

### Frontend

- **Next.js 16 (App Router)**  
  - React 19 + TypeScript 5.2  
  - Routes live under `app/...` (e.g. `app/admin/reports/page.tsx`)
- **Tailwind CSS**
  - Config in `tailwind.config.ts`
  - Global styles in `app/globals.css`
- **shadcn/ui**
  - Config via `components.json`
  - Uses **Radix UI primitives**, `class-variance-authority`, and `tailwind-merge`
- **Theming & UI extras**
  - `next-themes` for light/dark mode switching
  - `lucide-react` for icons
  - `embla-carousel-react` for carousels/sliders
  - `recharts` for charts/analytics
  - `cmdk` for command palette / global actions
  - `sonner` for toasts/notifications

### Forms & Validation

- `react-hook-form` for controlled forms
- `zod` for schema validation
- `@hookform/resolvers` to connect zod + react-hook-form

### Backend / Data

- **Supabase** for:
  - Auth (students + admins)
  - PostgreSQL database
  - Storage (images & files)
  - Realtime (messaging, notifications, live updates)
- Supabase client:
  - Located at `lib/supabase.ts`
  - Uses `NEXT_PUBLIC_SUPABASE_URL` and anon key from `.env`
- Schema & migrations:
  - Managed via SQL migrations under `supabase/migrations/*`
  - Covers:
    - missions (jobs)
    - gear/marketplace (materials)
    - forum (posts/comments)
    - messaging (conversations/messages)
    - ratings & reviews
    - notifications
    - reports/moderation
    - RLS policies and indexes

### AI

- **Next.js AI (Vercel AI SDK)** for:
  - Streaming chat UI
  - Prompt management and response handling
- LLM provider(s):
  - Configurable via environment variables (e.g. OpenAI / Groq / Gemini / etc.)

### Tooling

- **TypeScript 5.2**  
- **ESLint** (Next.js config)  
- **PostCSS + autoprefixer**  
- **npm** with `package-lock.json`  
  - Scripts:
    - `dev` – start dev server
    - `build` – production build
    - `start` – start production server
    - `lint` – run ESLint
    - `typecheck` – run TypeScript type-checker

---

## 🧬 Architecture Overview

### App Structure

- **App Router** entry under `app/`:
  - `admin/` (reports, moderation)
  - `ai-assistant/`
  - `forum/`
  - `home/`
  - `jobs/`
  - `marketplace/`
  - `messages/`
  - `profile/`
  - `sign-in/`, `sign-up/`

- Layouts:
  - `app/layout.tsx` – root shell (theme, fonts, base layout)
  - `app/home/layout.tsx` (and other route layouts)

### Feature Modules

- `app/jobs`
- `app/marketplace`
- `app/forum`
- `app/messages`
- `app/notifications` (integrated)
- `app/profile` (ratings)
- `app/admin` / `app/reports`
- `app/ai-assistant`

Each feature typically contains:

- `components/`
- `hooks/`
- `api/`
- `types/`
- `utils/`

### Data Access

- All DB access goes through the Supabase client in `lib/supabase.ts`
- (Optionally) feature-level API abstractions in:
  - `features/*/api/*.ts`

### Styling & Components

- `app/globals.css` for base resets and Tailwind layers
- `components/ui/*` for shared UI primitives (shadcn-generated + custom)
- `components/layout/*` for app-level layout pieces (navbar, page header, notification dropdown)
