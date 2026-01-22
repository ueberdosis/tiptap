# DibDab Spring Clean - Package Audit & Removal Plan

**Date:** 2026-01-22
**Objective:** Streamline DibDab to focus on React-based canvas editing use cases

---

## Executive Summary

**Total Packages:** 61 packages (48 active + 13 deprecated)
**Recommended for Removal:** 35 packages (57%)
**Recommended to Keep:** 26 packages (43%)

**Impact:**
- Significantly reduced maintenance burden
- Faster build times and simpler dependency tree
- Clearer focus on core canvas editing functionality
- React-first approach for initial release

---

## Package Inventory & Analysis

### CORE PACKAGES (KEEP - 6 packages)

These are fundamental to the editor and must be retained:

| Package | Purpose | Justification |
|---------|---------|---------------|
| `@dibdab/core` | Headless rich text editor core | Essential - the foundation of everything |
| `@dibdab/pm` | ProseMirror wrapper | Essential - core dependency for editor functionality |
| `@dibdab/react` | React components | Essential - our primary framework |
| `@dibdab/html` | Render JSON as HTML | Useful - for server-side rendering and export |
| `@dibdab/markdown` | Markdown parser/serializer | Useful - common format for import/export |
| `@dibdab/static-renderer` | Static rendering | Useful - for SSR and static generation |

---

### TEXT FORMATTING EXTENSIONS (KEEP - 10 packages)

Basic text formatting essential for any rich text editor:

| Package | Purpose | Canvas Use Case |
|---------|---------|----------------|
| `@dibdab/extension-text` | Base text node | Essential - fundamental |
| `@dibdab/extension-paragraph` | Paragraph node | Essential - fundamental |
| `@dibdab/extension-document` | Document node | Essential - fundamental |
| `@dibdab/extension-bold` | Bold formatting | Essential - basic formatting |
| `@dibdab/extension-italic` | Italic formatting | Essential - basic formatting |
| `@dibdab/extension-underline` | Underline formatting | Essential - basic formatting |
| `@dibdab/extension-strike` | Strikethrough | Essential - basic formatting |
| `@dibdab/extension-heading` | Headings (H1-H6) | Essential - document structure |
| `@dibdab/extension-hard-break` | Line breaks | Essential - basic functionality |
| `@dibdab/extension-text-style` | Text styling base | Essential - foundation for styling |

---

### USEFUL EXTENSIONS (KEEP - 5 packages)

Extensions that enhance canvas editing without bloating:

| Package | Purpose | Canvas Use Case |
|---------|---------|----------------|
| `@dibdab/extension-color` | Text color | Very useful for canvas/design tools |
| `@dibdab/extension-font-family` | Font selection | Very useful for canvas/design tools |
| `@dibdab/extension-text-align` | Text alignment | Useful for layout control |
| `@dibdab/extension-image` | Image embedding | Useful for rich content |
| `@dibdab/extension-link` | Hyperlinks | Useful for interactive content |

---

### UTILITY PACKAGES (KEEP - 5 packages)

Core utilities and bundled extensions:

| Package | Purpose | Justification |
|---------|---------|---------------|
| `@dibdab/extensions` | Bundled utility extensions | Contains essential utilities (placeholder, focus, drop-cursor, gap-cursor, undo-redo, character-count, selection, trailing-node) |
| `@dibdab/suggestion` | Suggestion/autocomplete plugin | Useful for mentions, slash commands |
| `@dibdab/extension-bubble-menu` | Context menu on selection | Very useful for canvas UX |
| `@dibdab/extension-floating-menu` | Floating menu | Useful for canvas UX |
| `@dibdab/extension-drag-handle-react` | React drag handles | Useful for content reordering |

**Note:** The `@dibdab/extensions` package is a consolidated package that includes:
- character-count (utility)
- drop-cursor (visual feedback)
- focus (focus styling)
- gap-cursor (cursor positioning)
- undo-redo (essential)
- placeholder (UX enhancement)
- selection (selection utilities)
- trailing-node (ensure final paragraph)

These are now part of `@dibdab/extensions` and the individual deprecated packages should be removed.

---

## REMOVAL RECOMMENDATIONS

### CATEGORY 1: Framework Support (REMOVE - 4 packages)

Focus on React initially. Vue support can be added back later if needed.

| Package | Reason for Removal |
|---------|-------------------|
| `@dibdab/vue-2` | Legacy framework (Vue 2 EOL), not needed for initial canvas focus |
| `@dibdab/vue-3` | Can add back later if Vue users emerge |
| `@dibdab/extension-drag-handle-vue-2` | Depends on Vue 2 |
| `@dibdab/extension-drag-handle-vue-3` | Depends on Vue 3 |

**Impact:** Removes Vue.js support entirely, simplifies build chain

---

### CATEGORY 2: Collaboration Features (REMOVE - 2 packages)

Not needed for initial canvas editing use case. Can add back when multiplayer is needed.

| Package | Reason for Removal |
|---------|-------------------|
| `@dibdab/extension-collaboration` | Real-time collaboration - complex feature not needed initially |
| `@dibdab/extension-collaboration-caret` | Shows other users' cursors - depends on collaboration |

**Impact:** Removes Y.js dependencies and complexity

---

### CATEGORY 3: Social Media Embeds (REMOVE - 3 packages)

Not relevant for canvas/design editing use cases.

| Package | Reason for Removal |
|---------|-------------------|
| `@dibdab/extension-youtube` | YouTube embeds - not a canvas editing requirement |
| `@dibdab/extension-twitch` | Twitch embeds - niche use case |
| `@dibdab/extension-audio` | Audio embeds - not needed initially |

**Impact:** Cleaner, more focused feature set

---

### CATEGORY 4: Advanced/Specialized Features (REMOVE - 8 packages)

Features that are not essential for basic canvas editing.

| Package | Reason for Removal |
|---------|-------------------|
| `@dibdab/extension-mathematics` | LaTeX math rendering - specialized use case |
| `@dibdab/extension-emoji` | Emoji picker - adds dependencies, users can paste emojis |
| `@dibdab/extension-table-of-contents` | Document navigation - more suited for long-form docs |
| `@dibdab/extension-mention` | @mentions - social feature, not needed for canvas |
| `@dibdab/extension-typography` | Smart quotes/dashes - nice-to-have, not essential |
| `@dibdab/extension-subscript` | Subscript formatting - specialized formatting |
| `@dibdab/extension-superscript` | Superscript formatting - specialized formatting |
| `@dibdab/extension-invisible-characters` | Show whitespace - debugging tool, not user feature |

**Impact:** Removes specialized dependencies and reduces bundle size

---

### CATEGORY 5: List & Block Extensions (REMOVE - 6 packages)

While useful, these can be added back selectively if needed. Canvas editing often uses simpler structures.

| Package | Reason for Removal |
|---------|-------------------|
| `@dibdab/extension-bullet-list` | Bullet lists - can add back if needed |
| `@dibdab/extension-ordered-list` | Numbered lists - can add back if needed |
| `@dibdab/extension-list` | Generic list extension |
| `@dibdab/extension-blockquote` | Block quotes - more suited for documents |
| `@dibdab/extension-details` | HTML details/summary - rarely used |
| `@dibdab/extension-horizontal-rule` | Horizontal dividers - simple feature, low priority |

**Impact:** Simpler content model for canvas use cases

**Note:** If you want to keep lists, remove this category from removal plan.

---

### CATEGORY 6: Code Extensions (REMOVE - 3 packages)

Code editing is not a primary use case for canvas tools.

| Package | Reason for Removal |
|---------|-------------------|
| `@dibdab/extension-code` | Inline code - developer-focused |
| `@dibdab/extension-code-block` | Code blocks - developer-focused |
| `@dibdab/extension-code-block-lowlight` | Syntax highlighting - developer-focused, large deps |

**Impact:** Removes syntax highlighting dependencies (lowlight/highlight.js)

**Note:** If you're building a tool that needs code snippets, keep these.

---

### CATEGORY 7: Table Extensions (REMOVE - 1 package)

Tables are complex and may not be needed for initial canvas release.

| Package | Reason for Removal |
|---------|-------------------|
| `@dibdab/extension-table` | Table support - complex feature, can add back later |

**Impact:** Removes table editing complexity

**Note:** Tables are very useful but complex. Consider keeping if your canvas needs structured data.

---

### CATEGORY 8: Additional Utilities (REMOVE - 2 packages)

| Package | Reason for Removal |
|---------|-------------------|
| `@dibdab/extension-highlight` | Text highlighting - might be useful, but can add back |
| `@dibdab/extension-node-range` | Node range utilities - internal utility, unclear usage |

---

### CATEGORY 9: Bundled Packages (REMOVE - 2 packages)

| Package | Reason for Removal |
|---------|-------------------|
| `@dibdab/starter-kit` | Bundles many extensions including those we're removing |
| `@dibdab/extension-drag-handle` | Generic drag handle (framework-agnostic), keep React version only |

**Note:** The starter-kit dependencies include many packages we're removing. It needs to be removed or completely refactored.

---

### CATEGORY 10: Deprecated Packages (REMOVE - 13 packages)

**All packages in `/packages-deprecated/` should be removed:**

These have been consolidated into `@dibdab/extensions`:

1. `extension-character-count` → Now in `@dibdab/extensions`
2. `extension-dropcursor` → Now in `@dibdab/extensions`
3. `extension-focus` → Now in `@dibdab/extensions`
4. `extension-gapcursor` → Now in `@dibdab/extensions`
5. `extension-history` → Now in `@dibdab/extensions` (as undo-redo)
6. `extension-list-item` → Deprecated
7. `extension-list-keymap` → Deprecated
8. `extension-placeholder` → Now in `@dibdab/extensions`
9. `extension-table-cell` → Deprecated
10. `extension-table-header` → Deprecated
11. `extension-table-row` → Deprecated
12. `extension-task-item` → Deprecated
13. `extension-task-list` → Deprecated

**Impact:** Clean up deprecated code, reduce confusion

---

### CATEGORY 11: Additional Package to Evaluate

| Package | Decision | Reason |
|---------|----------|--------|
| `@dibdab/extension-unique-id` | EVALUATE | Might be needed for tracking nodes in canvas, check usage first |
| `@dibdab/extension-file-handler` | EVALUATE | Could be useful for drag-drop files into canvas |

---

## Recommended Keep List (26 packages)

### Must Keep (26 packages):
1. `@dibdab/core` - Core editor
2. `@dibdab/pm` - ProseMirror wrapper
3. `@dibdab/react` - React framework support
4. `@dibdab/html` - HTML rendering
5. `@dibdab/markdown` - Markdown support
6. `@dibdab/static-renderer` - Static rendering
7. `@dibdab/extensions` - Bundled utilities
8. `@dibdab/suggestion` - Suggestions/autocomplete
9. `@dibdab/extension-text` - Text node
10. `@dibdab/extension-paragraph` - Paragraph node
11. `@dibdab/extension-document` - Document node
12. `@dibdab/extension-bold` - Bold
13. `@dibdab/extension-italic` - Italic
14. `@dibdab/extension-underline` - Underline
15. `@dibdab/extension-strike` - Strikethrough
16. `@dibdab/extension-heading` - Headings
17. `@dibdab/extension-hard-break` - Line breaks
18. `@dibdab/extension-text-style` - Text styling
19. `@dibdab/extension-color` - Text color
20. `@dibdab/extension-font-family` - Font selection
21. `@dibdab/extension-text-align` - Text alignment
22. `@dibdab/extension-image` - Images
23. `@dibdab/extension-link` - Links
24. `@dibdab/extension-bubble-menu` - Context menu
25. `@dibdab/extension-floating-menu` - Floating menu
26. `@dibdab/extension-drag-handle-react` - React drag handles

### Consider Keeping (2 packages):
- `@dibdab/extension-unique-id` - May be needed for canvas node tracking
- `@dibdab/extension-file-handler` - Useful for file drag-drop

---

## Recommended Removal List (35 packages)

### Framework (4):
1. `@dibdab/vue-2`
2. `@dibdab/vue-3`
3. `@dibdab/extension-drag-handle-vue-2`
4. `@dibdab/extension-drag-handle-vue-3`

### Features (22):
5. `@dibdab/extension-collaboration`
6. `@dibdab/extension-collaboration-caret`
7. `@dibdab/extension-youtube`
8. `@dibdab/extension-twitch`
9. `@dibdab/extension-audio`
10. `@dibdab/extension-mathematics`
11. `@dibdab/extension-emoji`
12. `@dibdab/extension-table-of-contents`
13. `@dibdab/extension-mention`
14. `@dibdab/extension-typography`
15. `@dibdab/extension-subscript`
16. `@dibdab/extension-superscript`
17. `@dibdab/extension-invisible-characters`
18. `@dibdab/extension-bullet-list`
19. `@dibdab/extension-ordered-list`
20. `@dibdab/extension-list`
21. `@dibdab/extension-blockquote`
22. `@dibdab/extension-details`
23. `@dibdab/extension-horizontal-rule`
24. `@dibdab/extension-code`
25. `@dibdab/extension-code-block`
26. `@dibdab/extension-code-block-lowlight`
27. `@dibdab/extension-table`
28. `@dibdab/extension-highlight`
29. `@dibdab/extension-node-range`
30. `@dibdab/starter-kit`
31. `@dibdab/extension-drag-handle`

### Deprecated (13 + directory):
32-44. All packages in `/packages-deprecated/`
45. Remove entire `/packages-deprecated/` directory

---

## Alternative: Minimal Removal Approach

If you want to be more conservative, here's a minimal removal plan:

### Definitely Remove (21 packages):

1. **Deprecated packages (13):** All of `/packages-deprecated/`
2. **Social embeds (3):** youtube, twitch, audio
3. **Vue 2 (2):** vue-2, extension-drag-handle-vue-2
4. **Specialized (3):** mathematics, emoji, invisible-characters

This removes 34% of packages while keeping most functionality intact.

---

## Implementation Plan

### Phase 1: Preparation
1. ✅ Audit complete
2. Document dependencies between packages
3. Identify any external consumers (if published)
4. Create backup branch

### Phase 2: Safe Removals (Low Risk)
1. Remove `/packages-deprecated/` directory entirely
2. Remove Vue 2 packages
3. Remove social media embed packages
4. Update workspace dependencies

### Phase 3: Feature Removals (Medium Risk)
1. Remove collaboration packages
2. Remove specialized extensions (math, emoji, etc.)
3. Remove code extensions
4. Update any internal references

### Phase 4: Structural Changes (Higher Risk)
1. Remove/refactor starter-kit
2. Remove Vue 3 packages
3. Remove list/table packages if decided
4. Clean up build configurations

### Phase 5: Testing & Validation
1. Run full test suite
2. Check build processes
3. Verify React package still works
4. Update documentation

---

## Cleanup Impact Summary

### Before:
- **Total packages:** 61 (48 active + 13 deprecated)
- **Framework support:** Core, React, Vue 2, Vue 3
- **Feature scope:** Everything from basic text to tables, collaboration, embeds, math

### After (Recommended):
- **Total packages:** 26-28
- **Reduction:** ~57% fewer packages
- **Framework support:** Core, React only
- **Feature scope:** Focused on canvas text editing with rich formatting

### Benefits:
- **Maintenance:** Much easier to maintain and update
- **Build time:** Faster builds with fewer packages
- **Bundle size:** Smaller bundles for end users
- **Clarity:** Clear focus on canvas editing use case
- **Dependencies:** Fewer external dependencies to manage

### Risks:
- **Feature requests:** Users might want removed features back
- **Migration:** If packages are published, might break consumers
- **Reversibility:** Removing packages is hard to undo

### Mitigation:
- Keep removed packages in Git history (can be restored)
- Document removed features clearly
- Consider feature flags instead of removal for uncertain packages
- Archive removed packages in a separate branch before deletion

---

## Decision Checkpoints

Before proceeding, confirm:

- [ ] Are these packages published to npm? (Check for external consumers)
- [ ] Do you need list functionality? (Consider keeping list packages)
- [ ] Do you need table functionality? (Consider keeping table package)
- [ ] Do you need code blocks? (Consider keeping code extensions)
- [ ] Is there any Vue.js usage planned? (Reconsider Vue removal)
- [ ] Review the "EVALUATE" packages for your specific use case

---

## Notes

- **File Handler**: `@dibdab/extension-file-handler` could be very useful for canvas apps (drag-drop images/files)
- **Unique ID**: `@dibdab/extension-unique-id` might be needed if you track/reference canvas nodes
- **Highlight**: `@dibdab/extension-highlight` is similar to bold/italic and might be worth keeping
- **Lists**: Many canvas tools do use bullet/numbered lists - reconsider if needed

---

## Next Steps

1. Review this plan with the team
2. Decide on conservative vs. aggressive cleanup
3. Create a cleanup branch
4. Execute removal in phases
5. Test thoroughly between phases
6. Update documentation and README files
7. Consider publishing migration guide if packages were public

**Recommendation:** Start with the "Minimal Removal Approach" (deprecated + social + Vue 2) to get ~34% reduction with very low risk, then evaluate if further removal is needed.
