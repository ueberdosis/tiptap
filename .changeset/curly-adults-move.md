---
'@tiptap/extension-text-style': minor
---

This updates the default value of the option `mergeNestedSpanStyles` to `true`, this will attempt to merge the styles of nested spans into the child span during HTML parsing. This prioritizes the style of the child span. This is used when parsing content created in other editors. (Fix for ProseMirror's default behavior.)
