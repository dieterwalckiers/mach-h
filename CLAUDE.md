# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo containing two main applications:

- **MachH/**: Main Qwik-based frontend application (community website)
- **MachH-admin/**: Sanity CMS studio for content management

## Development Commands

### Frontend (MachH/)

**Must use npm (not yarn)** - The project has build issues with yarn package manager.

```bash
# Development
cd MachH
npm start              # Start development server
npm run dev            # Alternative development command

# Building
npm run build          # Full production build
npm run build.client   # Client-only build
npm run build.server   # Server-only build for Vercel Edge
npm run build.types    # Type checking

# Code Quality
npm run lint           # ESLint check
npm run fmt            # Format code with Prettier
npm run fmt.check      # Check formatting

# Deployment
npm run deploy         # Deploy to Vercel (development)
npm run deploy.prod    # Deploy to Vercel (production)
npm run preview        # Build and preview locally
```

### CMS Admin (MachH-admin/)

```bash
# Development
cd MachH-admin
npm run dev            # Start Sanity Studio
npm start              # Alternative start command

# Building & Deployment
npm run build          # Build the studio
npm run deploy         # Deploy studio to Sanity
npm run deploy-graphql # Deploy GraphQL API
```

## Architecture Overview

### Frontend (Qwik Application)

The frontend is built with Qwik framework and follows these patterns:

- **File-based routing**: Routes are defined in `src/routes/` directory
- **Component structure**: Reusable components in `src/components/`
- **Data fetching**: Uses `routeLoader$` functions for server-side data loading
- **CMS integration**: Connects to Sanity CMS via `src/cms/sanityClient.ts`
- **Styling**: TailwindCSS with custom Mach-H theme colors

**Key architectural components:**
- `src/routes/layout.tsx`: Main layout with global context, fetches projects and settings
- `src/contract.ts`: TypeScript interfaces for all data models
- `src/util/`: Utility functions for normalization, responsive design, email handling
- `src/components/`: UI components organized by feature

**Data flow:**
1. Layout loads global data (projects, settings) from Sanity
2. Individual routes load specific data via `routeLoader$`
3. Components consume data via props or context
4. All data is normalized through `src/util/normalizing.ts`

### CMS (Sanity Studio)

Content management through Sanity CMS with these content types:
- **Projects**: Main content with images, descriptions, events
- **Events**: Date-based content with subscription capability
- **Posts**: News/blog content
- **Settings**: Global site configuration
- **Static pages**: About, Privacy Policy

**Schema location**: `MachH-admin/schemas/`

## Environment Configuration

Create `.env.local` file in MachH/ directory for environment variables:
- `SUPABASE_URL`: Database URL
- `SUPABASE_ANON_KEY`: Database access key
- Other environment variables as needed

## Database (Supabase)

The frontend reads/writes the `attendees` table in `public` via the Data API (`supabase-auth-helpers-qwik`). Used in event registration, payment status, and the Mollie webhook.

**When adding a new table that the frontend will access via supabase-js / PostgREST**, the migration must include explicit grants — from Oct 30, 2026, Supabase no longer grants `public` tables to API roles by default. Without grants, requests fail with PostgREST error `42501`.

```sql
grant select on public.new_table to anon;
grant select, insert, update, delete on public.new_table to authenticated;
grant select, insert, update, delete on public.new_table to service_role;
alter table public.new_table enable row level security;
-- + RLS policies
```

Existing tables (`attendees`) keep their current grants and are unaffected.

## Deployment

- **Frontend**: Deployed to Vercel Edge Functions
- **CMS**: Hosted on Sanity Cloud
- **Database**: Supabase for event subscriptions

## Development Notes

- The application uses server-side rendering (SSR) during development
- Sanity project ID is hardcoded: `x6sfouap`
- Custom responsive design utilities in `src/util/rwd.ts`
- Email functionality via Resend service in `src/util/mail.ts`
- Build failures often caused by unused imports - run `npx qwik build --help` for debugging

## Key Features

- Event management with subscription system
- Project showcase with dynamic tiles
- Newsletter subscription
- Calendar overview
- Mobile-responsive design
- Sanity CMS integration for content management

## Style guide

- prefer double quotes