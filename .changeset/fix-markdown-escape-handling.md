---
'@tiptap/markdown': patch
---

Fix backslash-escape handling in the Markdown parser and serializer. Parsing a backslash-escaped markdown character (e.g. `\*`, `\_`, `\\`) now correctly produces a literal text node, instead of silently dropping the character. On serialization, characters that have special meaning in markdown inline syntax (`*`, `_`, `` ` ``, `[`, `]`, `\`, `~`) are now backslash-escaped in non-code text nodes to prevent them from being misinterpreted as formatting delimiters when the output is parsed again.
