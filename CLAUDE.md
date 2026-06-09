# Gana Soft

## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills:
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/retro`, `/investigate`, `/document-release`, `/document-generate`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`

## Project Structure

This is a Turborepo monorepo using pnpm workspaces.

- `apps/` — applications
- `docker/` — Docker configuration
- `docker-compose.yml` — local development services

## Commands

```bash
pnpm dev          # run all apps in development
pnpm build        # build all apps
pnpm lint         # lint all apps
pnpm db:migrate   # run Prisma migrations
pnpm db:seed      # seed the database
pnpm db:studio    # open Prisma Studio
```
