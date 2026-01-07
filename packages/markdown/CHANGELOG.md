# @tiptap/markdown

## 3.15.2

### Patch Changes

- @tiptap/core@3.15.2
- @tiptap/pm@3.15.2

## 3.15.1

### Patch Changes

- @tiptap/core@3.15.1
- @tiptap/pm@3.15.1

## 3.15.0

### Patch Changes

- Updated dependencies [ac8361c]
  - @tiptap/core@3.15.0
  - @tiptap/pm@3.15.0

## 3.14.0

### Patch Changes

- @tiptap/core@3.14.0
- @tiptap/pm@3.14.0

## 3.13.0

### Patch Changes

- 7725052: Fixed trailing and leading whitespace handling in markdown serialization for inline marks
- Updated dependencies [526365a]
- Updated dependencies [e3b4f68]
  - @tiptap/core@3.13.0
  - @tiptap/pm@3.13.0

## 3.12.1

### Patch Changes

- @tiptap/core@3.12.1
- @tiptap/pm@3.12.1

## 3.12.0

### Patch Changes

- Updated dependencies [f232c5a]
  - @tiptap/core@3.12.0
  - @tiptap/pm@3.12.0

## 3.11.1

### Patch Changes

- Updated dependencies [d0c4264]
  - @tiptap/core@3.11.1
  - @tiptap/pm@3.11.1

## 3.11.0

### Patch Changes

- Updated dependencies [541c93c]
  - @tiptap/core@3.11.0
  - @tiptap/pm@3.11.0

## 3.10.8

### Patch Changes

- f3bb5c1: Fixed CommonJS compatibility by downgrading `marked` dependency from v16 to v15.
- Updated dependencies [8375241]
- Updated dependencies [b7ead7c]
- Updated dependencies [95d3e80]
- Updated dependencies [fd479bd]
  - @tiptap/core@3.10.8
  - @tiptap/pm@3.10.8

## 3.10.7

### Patch Changes

- @tiptap/core@3.10.7
- @tiptap/pm@3.10.7

## 3.10.6

### Patch Changes

- @tiptap/core@3.10.6
- @tiptap/pm@3.10.6

## 3.10.5

### Patch Changes

- Updated dependencies [92fae18]
  - @tiptap/core@3.10.5
  - @tiptap/pm@3.10.5

## 3.10.4

### Patch Changes

- Updated dependencies [64561c4]
  - @tiptap/core@3.10.4
  - @tiptap/pm@3.10.4

## 3.10.3

### Patch Changes

- 13fdcb5: Fix markdown serialization to prevent marks from continuing after hard breaks. Previously, marks like bold would incorrectly persist across hard breaks in the markdown output.
- 5774fc2: Fixed a bug where marks were resolved in incorrect orders, breaking markdown rendering for nested marks.
- f80391b: Fix parsing of mixed bullet lists and task lists. Previously, Marked.js would group consecutive bullet list items and task list items into a single list token, causing incorrect parsing. Now the parser detects mixed lists and splits them into separate bulletList and taskList nodes.
  - @tiptap/core@3.10.3
  - @tiptap/pm@3.10.3

## 3.10.2

### Patch Changes

- 194af3b: Fix parsing of mixed inline HTML within Markdown content so that inline HTML fragments are parsed correctly.
  - @tiptap/core@3.10.2
  - @tiptap/pm@3.10.2

## 3.10.1

### Patch Changes

- Updated dependencies [3564e7c]
  - @tiptap/core@3.10.1
  - @tiptap/pm@3.10.1

## 3.10.0

### Patch Changes

- Updated dependencies [4aa9f57]
- Updated dependencies [4aa9f57]
  - @tiptap/core@3.10.0
  - @tiptap/pm@3.10.0

## 3.9.1

### Patch Changes

- @tiptap/core@3.9.1
- @tiptap/pm@3.9.1

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
