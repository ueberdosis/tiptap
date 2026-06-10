---
'@tiptap/markdown': patch
---

Fix custom markdown tokenizers being dropped when a dedicated `marked` instance is injected into `MarkdownManager`. Parsing built the lexer with a no-arg `new this.markedInstance.Lexer()`, which reads marked's module-level defaults instead of the injected instance's `use()`-registered extensions — so any custom `markdownTokenizer` (e.g. subscript, superscript, math) registered on that instance silently stopped firing. The lexer is now seeded with the instance's configured `defaults`.
