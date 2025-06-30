# @tiptap/extension-mathematics

## 3.0.0-beta.18

### Major Changes

- 4a421bf: Change the way inserting math nodes work – now if no LaTeX string is used for both inline and block math nodes, the current text selection will be used and replaced. This should bring the extension more in line with how other extensions work.
- 4a421bf: Updated the default class names of the invisible and mathematics plugins

### Minor Changes

- 4a421bf: Added a new `migrateMathStrings` utility that can be used to migrate existing LaTeX math strings on an existing document into the inline math nodes`

### Patch Changes

- 4a421bf: Improved JSDoc documentation and comments
  - @tiptap/core@3.0.0-beta.18
  - @tiptap/pm@3.0.0-beta.18

## 3.0.0-beta.17

### Major Changes

- ab8bc2f: The Math extension now uses **nodes** to render mathematic content in the editor. This should improve the performance when an editor renders many math equations at the same time.

  This change is not backwards compatible, so you will need to update your code to use the new node-based API.

  At the same time, the `Mathematics` extension has been renamed to `Math` to better align with the naming conventions of other extensions - but the old name is still available for backwards compatibility.

  This extension includes two new nodes:

  - `MathInline` for inline math equations
  - `MathBlock` for block math equations

  The regex patterns for the input rules were also updated to be less conflicting with text including dollar signs. The new patterns are:

  - Inline: `/(?<!\$)\$\$([^$\n]+)\$\$(?!\$)$/` - for inline math equations, which will match text between two double dollar signs.
  - Block: `/^\$\$\$([^$]+)\$\$\$/` - for block math equations, which will match text between two triple dollar signs.

  Since the old way of using text content to reflect math equations came with limitations and performance issues, the new node-based approach now requires an explicit update command to update a math equations latex content. This can be done by using:

  - `editor.commands.updateInlineMath({ latex: '3x^2 + 2x + 1' })` for inline math equations.
  - `editor.commands.updateBlockMath({ latex: '3x^2 + 2x + 1' })` for block math equations.

  Both nodes allow for an `onClick` option that will pass the position and node information up which can be used to trigger a custom action, such as opening a math editor dialog.

### Patch Changes

- Updated dependencies [e20006b]
  - @tiptap/core@3.0.0-beta.17
  - @tiptap/pm@3.0.0-beta.17

## 3.0.0-beta.16

### Patch Changes

- Updated dependencies [ac897e7]
- Updated dependencies [bf835b0]
  - @tiptap/core@3.0.0-beta.16
  - @tiptap/pm@3.0.0-beta.16

## 3.0.0-beta.15

### Patch Changes

- Updated dependencies [087d114]
  - @tiptap/core@3.0.0-beta.15
  - @tiptap/pm@3.0.0-beta.15

## 3.0.0-beta.14

### Patch Changes

- Updated dependencies [95b8c71]
  - @tiptap/core@3.0.0-beta.14
  - @tiptap/pm@3.0.0-beta.14

## 3.0.0-beta.13

### Patch Changes

- @tiptap/core@3.0.0-beta.13
- @tiptap/pm@3.0.0-beta.13

## 3.0.0-beta.12

### Patch Changes

- @tiptap/core@3.0.0-beta.12
- @tiptap/pm@3.0.0-beta.12

## 3.0.0-beta.11

### Patch Changes

- @tiptap/core@3.0.0-beta.11
- @tiptap/pm@3.0.0-beta.11

## 3.0.0-beta.10

### Minor Changes

- 7ac01ef: We open sourced our basic pro extensions

  This release includes the following extensions that were previously only available in our Pro version:

  - `@tiptap/extension-drag-handle`
  - `@tiptap/extension-drag-handle-react`
  - `@tiptap/extension-drag-handle-vue-2`
  - `@tiptap/extension-drag-handle-vue-3`
  - `@tiptap/extension-emoji`
  - `@tiptap/extension-details`
  - `@tiptap/extension-file-handler`
  - `@tiptap/extension-invisible-characters`
  - `@tiptap/extension-mathematics`
  - `@tiptap/extension-node-range`
  - `@tiptap/extension-table-of-contents`
  - `@tiptap/extension-unique-id`

### Patch Changes

- @tiptap/core@3.0.0-beta.10
- @tiptap/pm@3.0.0-beta.10
