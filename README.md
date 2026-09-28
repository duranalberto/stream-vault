# StreamVault

A video-on-demand website for browsing and playing a curated catalog of gameplay
videos (Splatoon 3, Mario Kart World, Mario Tennis Fever). The catalog and
streams are served from an Amazon CloudFront distribution; a local copy of the
catalog (`catalog.json`) is bundled as a fallback when the remote one is
unreachable.

## Features

- Catalog home page with a responsive video grid and filters by game (and
  online/offline mode)
- Video detail page with an HLS player (Video.js + hls.js), metadata, tags, and
  a share bar
- Catalog fetch with timeout, strict payload validation, and fallback to the
  bundled `catalog.json`
- 404 routes for unknown videos and unmatched URLs

## Tech stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [Chakra UI v3](https://chakra-ui.com) for styling
- [react-router-dom](https://reactrouter.com) for routing (`/` and
  `/video/:id` with lazy-loaded player route)
- [`@videojs/react`](https://www.npmjs.com/package/@videojs/react) +
  [hls.js](https://github.com/video-dev/hls.js) for HLS playback
- [Vitest](https://vitest.dev) + Testing Library (jsdom) for tests
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html) for linting

## Getting started

Requires [Node.js](https://nodejs.org) 20+.

```sh
npm install
```

## Development

```sh
npm run dev
```

Starts the Vite dev server. The dev server proxies `/cdn/*` to the CloudFront
origin (see `vite.config.ts`), so catalog and media requests are same-origin
and never depend on the CDN's CORS headers.

## Scripts

| Command              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Start the dev server                                 |
| `npm run build`      | Type-check (`tsc -b`) and build a production bundle  |
| `npm run preview`    | Preview the production build locally                 |
| `npm run test`       | Run the Vitest suite once                            |
| `npm run test:watch` | Run tests in watch mode                              |
| `npm run lint`       | Lint the codebase with oxlint                        |

## Project structure

```
catalog.json          Bundled catalog fallback
src/
  api/                Catalog fetching, remote URL, local fallback
  components/         UI pieces (player, video card, filter bar, share bar)
  hooks/              Data/behavior hooks (useCatalog, useDocumentTitle)
  lib/                Pure logic (filters, formatting, toast store)
  pages/              Route components (home, video, 404)
  test/               Test setup and fixtures
  types/              Shared type definitions
```

## Testing

Tests live next to the code they cover (`src/**/*.test.{ts,tsx}`) and run under
vitest with a jsdom environment:

```sh
npm test
```

## Hosting

This is a static site: run `npm run build` and host the `dist/` directory from
any static host. For a ready-made setup, see
[docs/DEPLOYING_GITHUB_PAGES.md](docs/DEPLOYING_GITHUB_PAGES.md).
