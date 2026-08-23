---
'@tiptap/extension-mathematics': patch
---

The inline math input rule no longer uses a regex lookbehind, which WebKit older than Safari 16.4 rejects at parse time, taking down every chunk the extension is bundled into.
