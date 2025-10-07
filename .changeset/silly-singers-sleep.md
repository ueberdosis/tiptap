---
'@tiptap/core': minor
'@tiptap/markdown': minor
---

Add comprehensive bidirectional markdown support to Tiptap through a new `@tiptap/markdown` package and markdown utilities in `@tiptap/core`.

**New Package: `@tiptap/markdown`** - A new official extension that provides full markdown parsing and serialization capabilities using [marked.js](https://marked.js.org) as the underlying markdown parser.

**Core Features:**

**Extension API**
- **`Markdown` Extension**: Main extension that adds markdown support to your editor
- **`MarkdownManager`**: Core engine for parsing and serializing markdown
  - Parse markdown strings to Tiptap JSON: `editor.markdown.parse(markdown)`
  - Serialize Tiptap JSON to markdown: `editor.markdown.serialize(json)`
  - Access to underlying marked.js instance: `editor.markdown.instance`

#### Editor Methods
- **`editor.getMarkdown()`**: Serialize current editor content to markdown string
- **`editor.markdown`**: Access to MarkdownManager instance for advanced operations

**Editor Options:**
- **`contentAsMarkdown`**: Parse initial content as markdown when creating the editor
  ```typescript
  new Editor({
    content: '# Hello World',
    contentAsMarkdown: true
  })
  ```

**Command Options:** All content commands now support an `asMarkdown` option:
- **`setContent(markdown, { asMarkdown: true })`**: Replace editor content with markdown
- **`insertContent(markdown, { asMarkdown: true })`**: Insert markdown at cursor position
- **`insertContentAt(position, markdown, { asMarkdown: true })`**: Insert markdown at specific position

For more, check [the documentation](https://tiptap.dev/docs/editor/core-concepts/markdown).

## ⚠️ Breaking Changes

None. This is a new feature that doesn't affect existing functionality. Markdown support is opt-in via the `@tiptap/markdown` extension.
