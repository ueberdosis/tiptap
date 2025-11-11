---
"@tiptap/core": patch
---

Fix `updateAttributes` and `resetAttributes` commands to return accurate results when used with `.can()`. Previously, these commands would always return `true` even when they couldn't perform the operation. Now they correctly return `false` when no matching nodes or marks are found in the selection.
