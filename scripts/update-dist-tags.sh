#!/usr/bin/env bash

# ...existing code...
# dynamically discover package names from packages/*/package.json and packages-deprecated/*/package.json
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

# ...existing code...

DRY_RUN=false   # set to false to actually run
# Use a tag name that is NOT a valid semver range. "v2" is rejected by npm.
# Change TAG_NAME if you need a different non-semver tag (e.g. "v2-latest" or "v2-rc").
TAG_NAME="v2-latest"
TARGET_VERSION="2.26.2"

echo "Discovered ${#PACKAGES[@]} packages to operate on."
echo "Ensure you are logged in (npm login) and have publish access."
echo "Using tag: $TAG_NAME (change TAG_NAME variable if needed)"
echo "DRY_RUN=$DRY_RUN"

for pkg in "${PACKAGES[@]}"; do
  latest=$(npm view "$pkg" dist-tags.latest 2>/dev/null) || { echo "WARN: $pkg not found or no latest"; continue; }
  if [ -z "$latest" ]; then
    echo "WARN: $pkg has no latest dist-tag"
    continue
  fi
  echo "$pkg -> latest: $latest"
  # Only operate on packages where the current 'latest' equals the TARGET_VERSION.
  if [ "$latest" != "$TARGET_VERSION" ]; then
    echo "SKIP: $pkg latest ($latest) != target ($TARGET_VERSION)"
    continue
  fi

  if [ "$DRY_RUN" = false ]; then
    echo "Tagging $pkg@$TARGET_VERSION as $TAG_NAME"
    npm dist-tag add "$pkg@$TARGET_VERSION" "$TAG_NAME"
  fi
done

echo "Done."
