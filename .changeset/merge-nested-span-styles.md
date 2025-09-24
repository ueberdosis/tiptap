---
"@tiptap/extension-text-style": patch
---

Merge nested span styles only for immediate child spans and guard style values.

- Replace non-standard/fragile selector approach and avoid re-processing nested `<span>` elements.
- Read parent style once, merge with child style only when present, and remove empty `style` attributes.
- Improves parsing performance and robustness in browsers, Node/JSDOM and tests.

This change fixes a bug that could cause exponential work when parsing deeply
nested `<span>` elements - in extreme cases that could make the tab unresponsive
or crash the renderer. It is a bugfix / performance improvement with no public API
changes.
