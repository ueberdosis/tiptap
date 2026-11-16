#!/usr/bin/env bash

set -euo pipefail

vp run build
vp run build:demos
bash ./scripts/check-package-dists.sh
vp run check:package-exports
vp exec changeset publish
