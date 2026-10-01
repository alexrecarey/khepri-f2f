# khepri-f2f

Infinity N5 face-to-face dice calculator. Static React/Vite app; the dice run
in Python (icepool) under Pyodide in a web worker. Layout and dependency rules
are in README.md ("How it's put together").

## Commands

- Node 24 LTS (`.nvmrc`, Volta pin); `yarn` installs (yarn 3.3.0, zero-install cache in `.yarn/cache`)
- `yarn test` — JS tests (`node --test src/`) + engine tests (pytest via uv)
- `yarn test:js` / `yarn test:engine` — one side only
- `yarn build` — production build (CI runs this too)
- `yarn dev` — dev server

## Working conventions

- One branch per feature off `main`; PRs are rebase-merged.
- Keep the short "why" comments when refactoring.
- `scripts/fetch-army.mjs` needs network access to api.corvusbelli.com.

## Every change gets a preview URL

Alex tests on Netlify deploy previews, not on a local machine. So for any
change, without being asked:

1. Work on a feature branch (never commit to `main`), commit and push.
2. Open a PR (a draft is fine) if the branch has none; Netlify only builds
   previews for PRs.
3. Run `scripts/preview-url.sh` after each push. It waits for the preview of
   the pushed commit and prints the URL.
4. End your reply with that URL and the short commit hash it was built from.
   The URL is stable per PR (`https://deploy-preview-<PR#>--khepri.netlify.app`)
   but only shows your change once the script succeeds for that commit.
   If the build fails, say so and link the deploy log instead.

## Claude cloud sessions

`scripts/claude-cloud-setup.sh` runs on SessionStart when
`CLAUDE_CODE_REMOTE=true` and installs yarn deps and uv/icepool. The browser
UI loads Pyodide from cdn.jsdelivr.net, so results only compute in a browser
that can reach it; rely on `yarn test` in the cloud.
