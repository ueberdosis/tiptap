# @tiptap/markdown

## 3.9.0

### Patch Changes

- Updated dependencies [bbb8e16]
  - @tiptap/core@3.9.0
  - @tiptap/pm@3.9.0

## 3.8.0

### Patch Changes

- @tiptap/core@3.8.0
- @tiptap/pm@3.8.0

## 3.7.2

### Patch Changes

- @tiptap/core@3.7.2
- @tiptap/pm@3.7.2

## 3.7.1

### Patch Changes

- f1fc469: Editors will not throw an error anymore when `content` is an empty string and `contentType` is `markdown`
- c9036bd: Remove invalid server configuration from package.json
  - @tiptap/core@3.7.1
  - @tiptap/pm@3.7.1

## 3.7.0

### Minor Changes

- 35645d9: Add comprehensive bidirectional markdown support to Tiptap through a new `@tiptap/markdown` package and Markdown utilities in `@tiptap/core`.

  **New Package: `@tiptap/markdown`** - A new official extension that provides full Markdown parsing and serialization capabilities using [MarkedJS](https://marked.js.org) as the underlying Markdown parser.

  **Core Features:**

  **Extension API**

  - **`Markdown` Extension**: Main extension that adds Markdown support to your editor
  - **`MarkdownManager`**: Core engine for parsing and serializing Markdown
    - Parse Markdown strings to Tiptap JSON: `editor.markdown.parse(markdown)`
    - Serialize Tiptap JSON to Markdown: `editor.markdown.serialize(json)`
    - Access to underlying marked.js instance: `editor.markdown.instance`

  #### Editor Methods

  - **`editor.getMarkdown()`**: Serialize current editor content to Markdown string
  - **`editor.markdown`**: Access to MarkdownManager instance for advanced operations

  **Editor Options:**

  - **`contentType`**: Control the type of content that is inserted into the editor. Can be `json`, `html` or `markdown` - defaults to `json` and will automatically detect invalid content types (like JSON when it is actually Markdown).
    ```typescript
    new Editor({
      content: '# Hello World',
      contentType: 'markdown',
    })
    ```

  **Command Options:** All content commands now support an `contentType` option:

  - **`setContent(markdown, { contentType: 'markdown' })`**: Replace editor content with markdown
  - **`insertContent(markdown, { contentType: 'markdown' })`**: Insert markdown at cursor position
  - **`insertContentAt(position, markdown, { contentType: 'markdown' })`**: Insert Markdown at specific position

  For more, check [the documentation](https://tiptap.dev/docs/editor/markdown).

### Patch Changes

- Updated dependencies [35645d9]
- Updated dependencies [35645d9]
- Updated dependencies [35645d9]
  - @tiptap/core@3.7.0
  - @tiptap/pm@3.7.0
