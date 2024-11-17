#!/bin/bash

# Detect the branch from argument
BRANCH=$(echo "$1")

PRE_PATH=".changeset/pre.json"

pre_json_exists=false
is_on_tag=false
is_on_pre_mode=false

grep -q '"mode": "pre"' "$PRE_PATH" && is_on_pre_mode=true || is_on_pre_mode=false

if [ -f "$PRE_PATH" ]; then
  pre_json_exists=true
fi

enter_pre_mode() {
  local branch="$1"
  local tag="$2"

  grep -q '"tag": "'$tag'"' "$PRE_PATH" && is_on_tag=true || is_on_tag=false

  if $is_on_tag && $pre_json_exists && $is_on_pre_mode; then
    echo "You are already in pre mode for '$tag' on '$branch'"
    exit 0
  fi

  npx changeset pre exit
  npx changeset pre enter "$tag"

  # Set needs_commit to true on github env
  echo "needs_commit=true" >> $GITHUB_ENV

  echo "Entered pre mode for '$branch' on '$tag'"
}

exit_pre_mode() {
  local needs_exit=false

  grep -q '"mode": "exit"' "$PRE_PATH" && needs_exit=false || needs_exit=true

  if ! $needs_exit || ! $pre_json_exists; then
    echo "You are not in pre mode"
    exit 0
  fi

  npx changeset pre exit

  # Set needs_commit to true on github env
  echo "needs_commit=true" >> $GITHUB_ENV

  echo "Exited pre mode"
}

case "$BRANCH" in
  develop)
    enter_pre_mode "develop" "pre"
    ;;
  next)
    enter_pre_mode "next" "next"
    ;;
  main)
    exit_pre_mode
    ;;
  *)
    exit 0
    ;;
esac