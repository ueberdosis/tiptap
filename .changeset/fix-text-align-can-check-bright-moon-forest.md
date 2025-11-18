---
"@tiptap/extension-text-align": patch
---

Fix `setTextAlign` and `unsetTextAlign` commands to work correctly with `.can()` checks. Changed logic from `.every()` to `.some()` to return `true` when at least one configured node type matches, rather than requiring all types to match.
