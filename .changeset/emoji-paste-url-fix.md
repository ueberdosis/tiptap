---
"@tiptap/extension-emoji": patch
---

Preserve prefixes when replacing emoji shortcodes to avoid unintended conversions.

Previously, shortcodes such as `:x:` could be converted into emoji nodes even when part of a larger string (e.g., in URLs or other text). The paste handler now preserves prefixes, which helps prevent unwanted conversions in such cases, but does not specifically target URLs.
