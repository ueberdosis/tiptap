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

**Unit tests**

- Updated 9 existing test files to include the new null-default attributes in expected JSON shapes: `createNodeFromContent`, `generateJSON`, `unmounted`, `taskItem`, `inlineMath`, `trailing-node`, `generateHTML`, `server-with-jsdom`
- Added new test suites for paragraph attributes (16 tests), heading attributes (16 tests), and `createSpacingAttributes` utility (22 tests)
