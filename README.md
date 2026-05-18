# Mach-H

Monorepo containing the Mach-H community website and its Sanity CMS studio.

## Structure

- [`MachH/`](./MachH) — Qwik frontend (community website), deployed to Vercel Edge.
- [`MachH-admin/`](./MachH-admin) — Sanity Studio for content management, deployed to Sanity Cloud.

Each app keeps its own `package.json` and is installed/built independently. See [CLAUDE.md](./CLAUDE.md) for development commands and architecture notes.

## History

This repo was created by merging two previously separate GitHub repositories. Their full commit histories are preserved via `git subtree` merges:

- `MachH/` history came from `dieterwalckiers/MachH`
- `MachH-admin/` history came from `dieterwalckiers/MachH-admin`
