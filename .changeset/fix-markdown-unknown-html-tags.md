---
'@tiptap/markdown': patch
---

Fix text inside unknown angle-bracket tags being silently swallowed during markdown parsing. HTML-like content such as `<enter existing CID here if available>` that does not map to any known element is now preserved as literal text instead of disappearing, which also prevents downstream `contentMatchAt` errors when complex schemas (Mention, Variable, Table) are in use.
