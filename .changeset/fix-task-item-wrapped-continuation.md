---
"@tiptap/core": patch
---

Fix markdown parsing dropping task-item continuation lines that are aligned under the marker's text column. A soft-wrapped line following a task item (e.g. indented six columns to line up under `- [ ] `, a common authoring style that LLMs also emit) was treated as nested content, dedented by a fixed amount that left it with four or more residual leading spaces, and then parsed by `marked` as an indented code block — which cannot interrupt a paragraph, so the line was silently dropped. `parseIndentedBlocks` now peels leading lazy paragraph-continuation lines into the item's main content so they merge into its paragraph (matching CommonMark renderers), and dedents any genuinely-nested content by its common indentation rather than a fixed amount. Genuinely-nested list items, blockquotes, code blocks, headings, and thematic breaks are still parsed as nested blocks.
