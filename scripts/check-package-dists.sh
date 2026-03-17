#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

shopt -s nullglob

declare -a missing_paths=()
declare -a package_dirs=()
declare -a empty_paths=()

for package_json in "$REPO_ROOT"/packages/*/package.json "$REPO_ROOT"/packages-deprecated/*/package.json; do
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
    continue
  fi

  dist_entries=("$dist_dir"/*)

  if [ "${#dist_entries[@]}" -eq 0 ]; then
    empty_paths+=("${dist_dir#"$REPO_ROOT"/}")
  fi
done

if [ "${#missing_paths[@]}" -eq 0 ] && [ "${#empty_paths[@]}" -eq 0 ]; then
  echo "All ${#package_dirs[@]} package dist directories exist and contain build artifacts."
  exit 0
fi

if [ "${#missing_paths[@]}" -gt 0 ]; then
  echo "Missing dist directories:"
  printf ' - %s\n' "${missing_paths[@]}"
fi

if [ "${#empty_paths[@]}" -gt 0 ]; then
  echo "Empty dist directories:"
  printf ' - %s\n' "${empty_paths[@]}"
fi

exit 1
