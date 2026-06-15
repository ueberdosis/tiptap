---
'@tiptap/extension-list': minor
'@tiptap/core': patch
---

**Ordered lists now support the `type` attribute** (`a`, `A`, `i`, `I`).

The `<ol>` `type` attribute is now fully preserved through the HTML round-trip:

- `type="a"` → lowercase alphabetical markers
- `type="A"` → uppercase alphabetical markers
- `type="i"` → lowercase roman numeral markers
- `type="I"` → uppercase roman numeral markers

**Paste from external editors** (Google Docs, Word, LibreOffice) now correctly detects the list style — both from the HTML `type` attribute and from CSS `list-style-type` properties.

**Plain text paste** of typed ordered list markers (e.g. `a. Item`, `I) Item`, `i. Item\nii. Item`) is detected and converted to the correct list type.

**Markdown round-trip** preserves typed markers: parsing `a. Item` creates `type: "a"`, and serializing a typed list back to markdown uses the correct prefix (e.g. `I.`, `ii.`).

**Joining** of adjacent lists now respects `type` — two lists with different types (e.g. default numeric and `type="a"`) are not merged.
