#!/usr/bin/env bash

# optional: set this env var to a valid npm automation token to avoid interactive 2FA/login
NPM_TOKEN="${NPM_TOKEN:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_found_packages=()

for dir in "$SCRIPT_DIR/packages" "$SCRIPT_DIR/packages-deprecated"; do
  [ -d "$dir" ] || continue
  while IFS= read -r pkgjson; do
    # prefer node to reliably parse package.json, fallback to jq, then naive grep
    if command -v node >/dev/null 2>&1; then
      name=$(node -e "try { console.log(require(process.argv[1]).name || '') } catch(e) { process.exit(0) }" "$pkgjson" 2>/dev/null)
    elif command -v jq >/dev/null 2>&1; then
      name=$(jq -r '.name // empty' "$pkgjson" 2>/dev/null)
    else
      name=$(grep -m1 '"name"' "$pkgjson" | sed -E 's/.*"name"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')
    fi
    if [ -n "$name" ]; then
      _found_packages+=("$name")
    fi
  done < <(find "$dir" -maxdepth 2 -type f -name package.json 2>/dev/null)
done

# dedupe while preserving order
declare -A _seen=()
PACKAGES=()
for p in "${_found_packages[@]}"; do
  if [ -z "${_seen[$p]+x}" ]; then
    PACKAGES+=("$p")
    _seen[$p]=1
  fi
done
unset _found_packages _seen

# defaults (change as needed)
DRY_RUN=false   # set to false to actually run
TARGET_VERSION="3.5.0"

echo "Discovered ${#PACKAGES[@]} packages to operate on."
echo "Ensure you are logged in (npm login) and have publish access, or set NPM_TOKEN env var for non-interactive runs."
echo "Setting dist-tag 'latest' -> $TARGET_VERSION for packages that publish that version"
echo "DRY_RUN=$DRY_RUN"

# If NPM_TOKEN is provided, create a temporary user config so npm uses it and
# you won't be prompted repeatedly (works for automation tokens).
TMP_NPMRC=""
if [ -n "${NPM_TOKEN:-}" ]; then
  TMP_NPMRC="$(mktemp)"
  echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > "$TMP_NPMRC"
  export NPM_CONFIG_USERCONFIG="$TMP_NPMRC"
  trap 'rm -f "$TMP_NPMRC"' EXIT
  echo "Using temporary npm token config (NPM_CONFIG_USERCONFIG=$NPM_CONFIG_USERCONFIG)"
else
  echo "No NPM_TOKEN set — npm may prompt for login/2FA for each action."
fi

tagged=0
skipped=0
missing_version=0
failed=0

for pkg in "${PACKAGES[@]}"; do
  # get current latest
  latest=$(npm view "$pkg" dist-tags.latest 2>/dev/null) || { echo "WARN: $pkg not found or no latest"; skipped=$((skipped+1)); continue; }
  if [ -z "$latest" ]; then
    echo "WARN: $pkg has no latest dist-tag"
    skipped=$((skipped+1))
    continue
  fi

  if [ "$latest" = "$TARGET_VERSION" ]; then
    echo "OK: $pkg already latest -> $TARGET_VERSION (skip)"
    skipped=$((skipped+1))
    continue
  fi

  # check that the package actually has TARGET_VERSION published
  if ! npm view "${pkg}@${TARGET_VERSION}" version >/dev/null 2>&1; then
    echo "SKIP: ${pkg} does not have version ${TARGET_VERSION} published"
    missing_version=$((missing_version+1))
    continue
  fi

  echo "Tagging ${pkg}@${TARGET_VERSION} as latest (current latest: $latest)"
  if [ "$DRY_RUN" = false ]; then
    if npm dist-tag add "${pkg}@${TARGET_VERSION}" latest; then
      tagged=$((tagged+1))
    else
      echo "ERROR: failed to tag ${pkg}@${TARGET_VERSION}"
      failed=$((failed+1))
    fi
  fi
done

echo "Done. Summary: tagged=$tagged skipped=$skipped missing_version=$missing_version failed=$failed"
