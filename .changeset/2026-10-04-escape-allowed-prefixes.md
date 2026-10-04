---
"@tiptap/suggestion": patch
---

Escape `allowedPrefixes` when building the suggestion prefix regex so `-`, `]`, `^`, and `\` are treated as literals.
