---
"@tiptap/extension-text-style": patch
---

Prefer the raw inline `style` attribute when parsing `color` and
`background-color` so the original format (hex, rgba/hsla, etc.) is
preserved instead of falling back to the computed `element.style.*`
value (which often resolves to `rgb(...)`).

This fixes mismatches where consumers (for example, demo toolbars and
color pickers) expected the original hex values when initializing the
editor from HTML.

- The `color` and `background-color` parsers now look for a `style`
  attribute first and extract the declared value. If no raw style is
  present, they still fall back to `element.style.color` /
  `element.style.backgroundColor`.

MIGRATION NOTES
- This is a patch-level change. It corrects parsing behavior and is the
  least-disruptive fix for the issue.
- If your code relied on the parser returning computed `rgb(...)`
  strings, you may see different string values (for example `#958DF1`
  instead of `rgb(149, 141, 241)`) when HTML contained hex values.
- If you need a stable, normalized format for comparisons, normalize the
  attribute (for example with a color utility like `tinycolor2`) before
  comparing or use the editor APIs in a way that doesn't depend on the
  exact string representation.
