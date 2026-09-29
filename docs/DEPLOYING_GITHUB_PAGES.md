# Serving and hosting on GitHub Pages

StreamVault is a static site — the production build in `dist/` can be served
from any static host. This guide covers the GitHub Pages workflow.

## Local: serve the production build

```sh
npm run build
npm run preview
```

`npm run preview` serves `dist/` and, like the dev server, proxies `/cdn/*` to
the CloudFront origin (both proxies are configured in `vite.config.ts`).
Catalog and HLS media therefore load same-origin.

## Push to GitHub

The deployment below is driven by CI on your GitHub repository, so the repo
must be public on GitHub (Pages on private repos requires a paid plan).

```sh
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

## Add the GitHub Actions workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      NODE_VERSION: "22"
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  validate:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name != 'workflow_dispatch'
    steps:
      - id: validate
          uses: actions/github-script@v8
        with:
          script: |
            github.rest.pages.getSite({
               owner: context.repo.owner,
               repo: context.repo.repo,
            })

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

This uses the current "Deploy to GitHub Pages with Express/Actions" template
pattern (build job → validate job → deploy job).

## Enable Pages in the repo settings

1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Wait for the workflow to complete after your next push

The site is then available at:

- `https://<owner>.github.io/<repo>/` — project site
- `https://<username-or-org>.github.io/` — user/org site (repo name must
  match the account name)

## Router base path and deep links

`src/app.tsx` builds the router with `createBrowserRouter`, `vite.config.ts`
sets `base: "/stream-vault/"`, so routes are clean:
`https://<owner>.github.io/<repo>/video/xyz`.

GitHub Pages has no SPA fallback, so a **hard** navigation (refresh, or pasting
a video URL cold) to `/stream-vault/video/xyz` returns GitHub's 404. The
bundled `public/404.html` redirects the user to `/stream-vault/` (the Home
page), from which they can re-open the video. In-app navigation (clicking a
video card) uses the history router and is unaffected.

If zero-404 deep links matter, either serve from a host with a SPA fallback
(custom domain, Cloudflare Pages, Vercel, …) or — less clean, but
zero-config — switch `createBrowserRouter` to `createHashRouter`, which yields
`https://<owner>.github.io/<repo>/#/video/xyz`.

## Media and CORS

- **Catalog**: the app rewrites the CloudFront URL to same-origin `/cdn/catalog/catalog.json`
  (see `toSameOrigin` in `src/api/constants.ts`). GitHub Pages serves no such
  route, so the fetch 404s and the app transparently falls back to the bundled
  `catalog.json`. To still show the live catalog on Pages you could keep the
  direct CloudFront URL instead — it answers `Access-Control-Allow-Origin: *`,
  so cross-origin fetch works there too.
- **HLS playback**: `HlsJsVideo` plays `video.playbackUrl` directly (also
  rewritten via `toSameOrigin` — same caveat: without a `/cdn` proxy the
  rewrite 404s and playback breaks). Point `toSameOrigin` back to the CDN
  origin (i.e., make it an identity function, or gate the rewrite on
  `import.meta.env.DEV`/preview) and hls.js loads playlists and segments
  cross-origin; the CloudFront distribution already sends
  `access-control-allow-origin: *` on them.

The simplest Pages-friendly change is in `src/api/constants.ts`:

```ts
export function toSameOrigin(url: string): string {
  return url; // served from a host with a /cdn proxy in dev and preview
}
```

or, to keep dev/preview same-origin but use the CDN elsewhere:

```ts
export function toSameOrigin(url: string): string {
  if (import.meta.env.DEV || import.meta.env.MODE === "preview") {
    return new URL(url).origin === CDN_ORIGIN
      ? `/cdn${new URL(url).pathname}`
      : url;
  }
  return url;
}
```

(Adjust to taste; tests that assert the rewrite should be updated to match.)

## Checklist

- [ ] `npm run build` passes locally
- [ ] Router base works on the target Pages URL (`public/404.html` covers
      hard-refresh deep links with a redirect to Home)
- [ ] Catalog and HLS playback resolve without a `/cdn` proxy (adjust
      `toSameOrigin`, or accept the bundled-catalog fallback)
- [ ] `.github/workflows/deploy.yml` added and Pages source set to
      **GitHub Actions**
- [ ] Workflow green; site reachable at `https://<owner>.github.io/<repo>/`
