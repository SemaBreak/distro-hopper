# Distro Hopper

A single-page app that picks a random Linux distribution from [DistroWatch](https://distrowatch.com/) and shows:

- the distro's main screenshot
- its key facts (OS type, based on, origin, architecture, desktop, status) and description
- one randomly chosen visitor review, if any exist

Click **Random distro** to hop to another one.

## How it works

DistroWatch doesn't allow requests from other websites (no CORS headers) and rejects requests without a `User-Agent`. So the page never talks to DistroWatch directly. It calls a small Netlify Function, which fetches the data server-side.

```
Browser ──► /.netlify/functions/dw?path=... ──► distrowatch.com
```

The function only accepts three kinds of path, so it can't be used as an open proxy:

| Path | Purpose | Caching |
|------|---------|---------|
| `random.php` | Redirects to a random distro page | Never cached, so each click gives a new distro |
| `dwres.php?resource=ratings&distro=<id>` | Reviews for a distro | 10 min on the CDN, 1 min in the browser |
| `images/...` (png, jpg, gif, webp) | Screenshots | 7 days on the CDN, 1 day in the browser |

Images are served through the function instead of being hotlinked from DistroWatch.

In the browser, the fetched HTML is sanitized before display: scripts, styles, iframes and forms are removed, links are replaced by their text, and inline event handlers are stripped.

## Project structure

```
index.html                  Page, styles and client-side script
netlify.toml                Netlify build settings
netlify/functions/dw.js     Server-side proxy for distrowatch.com
```

## Run locally

Requires [Node.js](https://nodejs.org/) and the Netlify CLI.

```sh
npm install -g netlify-cli
netlify dev
```

Opening `index.html` directly won't work, because it needs the function.

## Notes

- Layout changes on DistroWatch can break the parsing in `index.html`.
