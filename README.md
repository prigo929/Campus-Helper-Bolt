# 🎓 Campus Helper

Campus Helper is a full-stack web platform for university students to:

- Find and post part-time jobs and micro-tasks  
- Buy and sell study materials (books, notes, devices)  
- Join campus discussion forums  
- Chat with other students in (near) real time  

It started as a university project, but the goal is to build it with **production-style architecture** using **Next.js (App Router)**, **TypeScript**, **Supabase**, **Tailwind CSS + shadcn/ui**, and **Vercel**, following a **Scrum** workflow in **Jira**.

---

## ✨ Features

### Core Features (MVP)

- **Authentication & Profiles**
  - Email / magic link (or password) login via Supabase Auth
  - Student profile: name, faculty, study year, bio, avatar
  - Role support: `student` (default) and `admin` (for moderation)

- **Dashboard**
  - Authenticated home view after login
  - Quick access to Jobs, Materials, Forum, Chat, Profile
  - Snapshot of recent activity (latest jobs/posts/messages)

- **Jobs & Tasks Marketplace**
  - Create job/task:
    - title, description, category, estimated pay, optional location
  - Browse jobs in a responsive card layout
  - Individual job details:
    - full description, posted by, creation time
  - Sorting & basic filtering (e.g. by category, newest first)

- **Materials Marketplace**
  - Create listings for books, notes, accessories, devices
  - Upload images via Supabase Storage
  - Materials list view + detail view
  - Contact seller via messaging

- **Forum**
  - Categories (e.g. General, Jobs, Materials, Campus News)
  - Create posts (title + content)
  - Comment threads for posts
  - Sort by newest / recent activity

- **Messaging**
  - 1:1 conversations between students
  - Started from job/material pages or profile
  - Realtime-ish updates via Supabase Realtime

- **Reporting & Moderation**
  - Report jobs, materials, posts, comments, or users
  - Admin reports panel:
    - see item, reporter, reason, timestamp
  - Admin actions:
    - mark as reviewed, delete content, optionally restrict users

---

### UX & Design

- Fully **responsive**:
  - Mobile, tablet, and desktop layouts
  - Card-based grids for jobs/materials, readable forum lists
- **Dark-first theme** using:
  - Navy as primary background
  - Gold as accent/primary action
  - Off-white / soft grays for text and surfaces
- Component library via **shadcn/ui + Radix UI**:
  - Buttons, inputs, dialogs, dropdowns, sheets, etc.
- Theme switching with **next-themes** (light/dark)
- Icons via **lucide-react**
- Modern UX extras:
  - Skeleton loaders
  - Toast notifications (via `sonner`)
  - Smooth animations and transitions (Framer Motion where needed)
  - Optional carousels (`embla-carousel-react`) and charts (`recharts`)
  - Command palette / quick actions via `cmdk`

---

### Planned / Stretch Features

- **Ratings & Reviews**
  - Rate users after a job or transaction
  - Display average rating and reviews on profiles

- **Notifications**
  - In-app notifications for:
    - new messages
    - interest/applications on your jobs
    - comments on your posts
  - Simple notification dropdown + “mark as read”

- **Global Search**
  - One search bar to find:
    - jobs
    - materials
    - forum posts

- **AI Assistant (future)**
  - “Campus Helper AI” for:
    - suggesting jobs/materials
    - summarizing forum threads or notes
    - answering common campus questions
  - Likely built with Vercel AI SDK + a free/cheap LLM API

---

## 🧱 Tech Stack (Current)

### Frontend

- **Next.js 16 (App Router)**  
  - React 18 + TypeScript 5.2  
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
  - Realtime (messaging, live updates)
- Supabase client:
  - Located at `lib/supabase.ts`
  - Uses `NEXT_PUBLIC_SUPABASE_URL` and anon key from `.env`
- Schema & migrations:
  - Managed via SQL migrations under `supabase/migrations/*`
  - Covers:
    - jobs
    - materials/marketplace
    - forum (posts/comments)
    - messaging (conversations/messages)
    - reports/moderation
    - RLS policies and indexes

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

- **App Router** entry under `src/app`:
  - `(public)` – landing, marketing pages
  - `(auth)` – login, register
  - `(dashboard)` – authenticated area:
    - `jobs/`
    - `materials/`
    - `forum/`
    - `chat/`
    - `profile/`
    - `admin/` (reports, moderation)
- Layouts:
  - `app/layout.tsx` – root shell (theme, fonts, base layout)
  - `app/(dashboard)/layout.tsx` – dashboard layout (navbar, sidebar, etc.)

### Feature Modules

- `features/jobs`
- `features/materials`
- `features/forum`
- `features/messaging`
- `features/reports` / `admin`
- Each feature typically contains:
  - `components/`
  - `hooks/`
  - `api/`
  - `types/`
  - `utils/`

### Data Access

- All DB access goes through the Supabase client in `lib/supabase.ts`
- (Optional) feature-level API abstractions in:
  - `features/*/api/*.ts`

### Styling & Components

- `app/globals.css` for base resets and Tailwind layers
- `components/ui/*` for shared UI primitives (shadcn-generated + custom)
- `components/layout/*` for app-level layout pieces (navbar, page header, etc.)
