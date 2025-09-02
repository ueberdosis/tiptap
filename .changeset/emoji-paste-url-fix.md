---
"@tiptap/extension-emoji": patch
---

Prevent emoji shortcodes from being converted when they appear inside pasted URLs.

Previously, pasting links such as `https://.../:x:/r/...` could unintentionally convert `:x:` (and similar shortcodes) into emoji nodes and break links. The paste handler now avoids replacing shortcodes that are part of URL-like text.
