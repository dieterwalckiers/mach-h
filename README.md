# Mach-H

Monorepo containing the Mach-H community website and its Sanity CMS studio.

## Structure

- [`MachH/`](./MachH) — Qwik frontend (community website), deployed to Vercel Edge.
- [`MachH-admin/`](./MachH-admin) — Sanity Studio for content management, deployed to Sanity Cloud.

Each app keeps its own `package.json` and is installed/built independently. See [CLAUDE.md](./CLAUDE.md) for development commands and architecture notes.

## History

This repo was created by merging two previously separate GitHub repositories. Their full commit histories are preserved via `git subtree` merges:

- `MachH/` history came from `dieterwalckiers/MachH` (subtree merge `738aa23`)
- `MachH-admin/` history came from `dieterwalckiers/MachH-admin` (subtree merge `bd299bf`)

### Viewing pre-merge history

Because the imported commits had files at their original (unprefixed) paths, plain `git log -- MachH/path/to/file` won't follow history through the subtree merge. To see the full history of an imported file, follow the merge's second parent:

```bash
# Full history of a frontend file (commits prior to the monorepo merge are reached via the second parent of 738aa23)
git log 738aa23^2 -- path/to/file        # path is RELATIVE to MachH/, no prefix
git log 738aa23 --follow -- MachH/path/to/file  # follows through the merge

# Same for the studio
git log bd299bf^2 -- path/to/file        # path is RELATIVE to MachH-admin/
```

`git blame MachH/path/to/file` works normally — blame follows content, not paths.
