#!/usr/bin/env bash
# Waits for the Cloudflare preview of the pushed HEAD commit and prints its URL.
# .github/workflows/deploy.yml uploads one per PR commit and reports it as the
# commit status "cloudflare/preview", so the branch needs an open PR.
# Reads public commit statuses, so it needs neither gh nor a token.
set -euo pipefail

repo="alexrecarey/khepri-f2f"
sha="$(git rev-parse HEAD)"
git branch -r --contains "$sha" | grep -q . || { echo "HEAD $sha is not pushed yet" >&2; exit 1; }

for _ in $(seq 40); do   # ~10 minutes; builds take about 2
  read -r state url < <(curl -fsS "https://api.github.com/repos/$repo/commits/$sha/statuses" | node -e '
const s = JSON.parse(require("fs").readFileSync(0, "utf8")).filter((x) => x.context === "cloudflare/preview");
console.log(s.length ? `${s[0].state} ${s[0].target_url}` : "none -");')  # newest status first
  case "$state" in
    success) echo "$url"; exit 0 ;;
    failure|error) echo "preview build failed: $url" >&2; exit 1 ;;
  esac
  sleep 15
done
echo "no preview for $sha after 10 minutes (is there an open PR for this branch?)" >&2
exit 1
