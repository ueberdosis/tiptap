---
"@tiptap/extension-link": patch
---

Add support for title attribute in Link extension's markdown rendering. Links with titles are now serialized to markdown format `[text](url "title")` and properly round-trip during parsing.
