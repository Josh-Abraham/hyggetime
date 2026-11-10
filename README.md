# Hyggetime

A React app built with [Vite](https://vitejs.dev/) and published to GitHub Pages at
https://josh-abraham.github.io/hyggetime.

## Development

```bash
npm install
npm start
```

Runs the dev server at [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Outputs the production build to `build/`. Preview it locally with `npm run preview`.

## Republishing the GitHub Page

From a git clone with an `origin` remote and push access:

```bash
npm run republish
```

This runs `republish.sh`, which checks the git setup, installs dependencies if needed,
then runs `npm run deploy` (build, then push `build/` to the `gh-pages` branch).

Alternatively, run `npm run deploy` directly to skip the checks.

One-time setup: in the GitHub repo, go to Settings → Pages and set the source to the
`gh-pages` branch (root). Changes usually appear within a minute or two.
