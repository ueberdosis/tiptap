#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

shopt -s globstar nullglob

declare -a missing_paths=()
declare -a package_dirs=()

for package_json in "$REPO_ROOT"/packages/**/package.json "$REPO_ROOT"/packages-deprecated/**/package.json; do
  if [[ "$package_json" == *"/node_modules/"* ]]; then
    continue
  fi

  package_dirs+=("${package_json%/package.json}")
done

if [ "${#package_dirs[@]}" -eq 0 ]; then
  echo "No package directories found."
  exit 1
fi

for package_dir in "${package_dirs[@]}"; do
  dist_dir="$package_dir/dist"

  if [ ! -d "$dist_dir" ]; then
    missing_paths+=("${dist_dir#"$REPO_ROOT"/}")
  fi
done

if [ "${#missing_paths[@]}" -eq 0 ]; then
  echo "All ${#package_dirs[@]} package dist directories exist."
  exit 0
fi

echo "Missing dist directories:"
printf ' - %s\n' "${missing_paths[@]}"
exit 1
