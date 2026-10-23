#!/usr/bin/env bash
# Prepares a Claude Code cloud session (claude.ai/code) to run khepri-f2f:
# yarn 3.3.0 via corepack, node_modules from the committed .yarn/cache,
# and the engine's Rust toolchain and crates fetched so `yarn test` works offline-ish.
# Runs from the SessionStart hook; a no-op on local machines.
set -euo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}"

# Node comes from .nvmrc (Volta pins the same version locally). The cloud image
# may ship another major; switch with nvm when it has one.
want="$(cat .nvmrc)"
if [ "$(node -v 2>/dev/null)" != "v$want" ] && [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  nvm install "$want" >/dev/null && nvm alias default "$want" >/dev/null
  [ -n "${CLAUDE_ENV_FILE:-}" ] && echo "export PATH=\"$(dirname "$(nvm which "$want")"):\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi
node -v | grep -q "^v${want%%.*}\." || echo "warning: node $(node -v) != $want" >&2

# Yarn must match the lockfile's 3.3.0.
command -v corepack >/dev/null || npm i -g corepack >/dev/null
corepack enable
corepack prepare yarn@3.3.0 --activate >/dev/null
yarn install --immutable >/dev/null

# test:engine runs cargo test; install rustup if the image lacks it.
if ! command -v rustup >/dev/null; then
  curl -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain none >/dev/null
  export PATH="$HOME/.cargo/bin:$PATH"
  [ -n "${CLAUDE_ENV_FILE:-}" ] && echo "export PATH=\"$HOME/.cargo/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi
# The pinned toolchain (engine-rs/rust-toolchain.toml, read from engine-rs/) and the crates, so the first
# test run is quick.
(cd engine-rs && cargo fetch --locked --quiet)

echo "khepri-f2f cloud setup done: yarn test / yarn dev ready"
