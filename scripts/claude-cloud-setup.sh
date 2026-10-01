#!/usr/bin/env bash
# Prepares a Claude Code cloud session (claude.ai/code) to run khepri-f2f:
# yarn 3.3.0 via corepack, node_modules from the committed .yarn/cache,
# and uv with icepool/pytest pre-fetched so `yarn test` works offline-ish.
# Runs from the SessionStart hook; a no-op on local machines.
set -euo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}"

# Volta pins node 18 locally; the cloud image ships a newer node. Tests and
# vite 4 run on node 22 (test:js lists files, since node 21+ rejects a dir).
# Yarn must match the lockfile's 3.3.0.
command -v corepack >/dev/null || npm i -g corepack >/dev/null
corepack enable
corepack prepare yarn@3.3.0 --activate >/dev/null
yarn install --immutable >/dev/null

# test:engine shells out to uv; install it if the image lacks it.
if ! command -v uv >/dev/null; then
  pip install -q uv 2>/dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh >/dev/null
  export PATH="$HOME/.local/bin:$PATH"
  [ -n "${CLAUDE_ENV_FILE:-}" ] && echo "export PATH=\"$HOME/.local/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi
# Warm uv's cache (python 3.12 + icepool + pytest) so the first test run is quick.
uv run -q --python 3.12 --with icepool==2.2.2 --with pytest python -c 'import icepool' >/dev/null

echo "khepri-f2f cloud setup done: yarn test / yarn dev ready"
