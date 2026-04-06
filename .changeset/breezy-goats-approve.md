---
'@tiptap/extension-paragraph': minor
'@tiptap/extension-heading': minor
---

Add support for more attributes across paragraph, and heading extensions

**@tiptap/extension-paragraph**

- Add `spacingBefore` attribute for paragraph top margin
- Add `spacingAfter` attribute for paragraph bottom margin
- Add `lineHeight` attribute for line height (supports both multiplier and absolute pixel values)
- Add `indent` attribute for left indentation
- Add `firstLineIndent` attribute for first-line text indent

**@tiptap/extension-heading**

- Add the same 5 spacing and indentation attributes as the paragraph extension (`spacingBefore`, `spacingAfter`, `lineHeight`, `indent`, `firstLineIndent`)
- All attributes coexist with the existing `level` attribute
