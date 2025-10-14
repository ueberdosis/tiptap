# @tiptap/extension-mathematics

## 3.7.0

### Patch Changes

- Updated dependencies [35645d9]
- Updated dependencies [35645d9]
- Updated dependencies [35645d9]
  - @tiptap/core@3.7.0
  - @tiptap/pm@3.7.0

## 3.6.7

### Patch Changes

- @tiptap/core@3.6.7
- @tiptap/pm@3.6.7

## 3.6.6

### Patch Changes

- @tiptap/core@3.6.6
- @tiptap/pm@3.6.6

## 3.6.5

### Patch Changes

- Updated dependencies [1e4caea]
  - @tiptap/core@3.6.5
  - @tiptap/pm@3.6.5

## 3.6.4

### Patch Changes

- @tiptap/core@3.6.4
- @tiptap/pm@3.6.4

## 3.6.3

### Patch Changes

- Updated dependencies [67f7b4a]
  - @tiptap/core@3.6.3
  - @tiptap/pm@3.6.3

## 3.6.2

### Patch Changes

- @tiptap/core@3.6.2
- @tiptap/pm@3.6.2

## 3.6.1

### Patch Changes

- @tiptap/core@3.6.1
- @tiptap/pm@3.6.1

## 3.6.0

### Patch Changes

- Updated dependencies [c0190bd]
  - @tiptap/core@3.6.0
  - @tiptap/pm@3.6.0

## 3.5.3

### Patch Changes

- @tiptap/core@3.5.3
- @tiptap/pm@3.5.3

## 3.5.2

### Patch Changes

- @tiptap/core@3.5.2
- @tiptap/pm@3.5.2

## 3.5.1

### Patch Changes

- @tiptap/core@3.5.1
- @tiptap/pm@3.5.1

## 3.5.0

### Patch Changes

- @tiptap/core@3.5.0
- @tiptap/pm@3.5.0

## 3.4.6

### Patch Changes

- Updated dependencies [968016f]
  - @tiptap/core@3.4.6
  - @tiptap/pm@3.4.6

## 3.4.5

### Patch Changes

- Updated dependencies [0226d42]
- Updated dependencies [37af83b]
- Updated dependencies [f598ac7]
  - @tiptap/core@3.4.5
  - @tiptap/pm@3.4.5

## 3.4.4

### Patch Changes

- Updated dependencies [00cf1d7]
  - @tiptap/core@3.4.4
  - @tiptap/pm@3.4.4

## 3.4.3

### Patch Changes

- Updated dependencies [1ea8906]
  - @tiptap/core@3.4.3
  - @tiptap/pm@3.4.3

## 3.4.2

### Patch Changes

- @tiptap/core@3.4.2
- @tiptap/pm@3.4.2

## 3.4.1

### Patch Changes

- @tiptap/core@3.4.1
- @tiptap/pm@3.4.1

## 3.4.0

### Patch Changes

- Updated dependencies [895c73f]
- Updated dependencies [ad51daa]
  - @tiptap/core@3.4.0
  - @tiptap/pm@3.4.0

## 3.3.1

### Patch Changes

- @tiptap/core@3.3.1
- @tiptap/pm@3.3.1

## 3.3.0

### Patch Changes

- Updated dependencies [5423726]
- Updated dependencies [5423726]
  - @tiptap/core@3.3.0
  - @tiptap/pm@3.3.0

## 3.2.2

### Patch Changes

- @tiptap/core@3.2.2
- @tiptap/pm@3.2.2

## 3.2.1

### Patch Changes

- Updated dependencies [6a2873f]
  - @tiptap/core@3.2.1
  - @tiptap/pm@3.2.1

## 3.2.0

### Patch Changes

- Updated dependencies [5056e3e]
  - @tiptap/core@3.2.0
  - @tiptap/pm@3.2.0

## 3.1.0

### Patch Changes

- c868252: Fixed an issue with the mathematics regex using modern negative lookups causing crashes in older Safari versions.
  - @tiptap/core@3.1.0
  - @tiptap/pm@3.1.0

## 3.0.9

### Patch Changes

- @tiptap/core@3.0.9
- @tiptap/pm@3.0.9

## 3.0.8

### Patch Changes

- @tiptap/core@3.0.8
- @tiptap/pm@3.0.8

## 3.0.7

### Patch Changes

- @tiptap/core@3.0.7
- @tiptap/pm@3.0.7

## 3.0.6

### Patch Changes

- Updated dependencies [2e71d05]
  - @tiptap/core@3.0.6
  - @tiptap/pm@3.0.6

## 3.0.5

### Patch Changes

- @tiptap/core@3.0.5
- @tiptap/pm@3.0.5

## 3.0.4

### Patch Changes

- Updated dependencies [7ed03fa]
  - @tiptap/core@3.0.4
  - @tiptap/pm@3.0.4

## 3.0.3

### Patch Changes

- Updated dependencies [75cabde]
  - @tiptap/core@3.0.3
  - @tiptap/pm@3.0.3

## 3.0.2

### Patch Changes

- @tiptap/core@3.0.2
- @tiptap/pm@3.0.2

## 3.0.1

### Major Changes

- 4a421bf: Change the way inserting math nodes work – now if no LaTeX string is used for both inline and block math nodes, the current text selection will be used and replaced. This should bring the extension more in line with how other extensions work.
- 4a421bf: Updated the default class names of the invisible and mathematics plugins
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

- 4a421bf: Added a new `migrateMathStrings` utility that can be used to migrate existing LaTeX math strings on an existing document into the inline math nodes`

### Patch Changes

- 4a421bf: Improved JSDoc documentation and comments
- Updated dependencies [1b4c82b]
- Updated dependencies [1e91f9b]
- Updated dependencies [a92f4a6]
- Updated dependencies [8de8e13]
- Updated dependencies [20f68f6]
- Updated dependencies [5e957e5]
- Updated dependencies [89bd9c7]
- Updated dependencies [d0fda30]
- Updated dependencies [0e3207f]
- Updated dependencies [37913d5]
- Updated dependencies [28c5418]
- Updated dependencies [32958d6]
- Updated dependencies [12bb31a]
- Updated dependencies [9f207a6]
- Updated dependencies [412e1bd]
- Updated dependencies [062afaf]
- Updated dependencies [ff8eed6]
- Updated dependencies [704f462]
- Updated dependencies [95b8c71]
- Updated dependencies [8c69002]
- Updated dependencies [664834f]
- Updated dependencies [ac897e7]
- Updated dependencies [087d114]
- Updated dependencies [32958d6]
- Updated dependencies [fc17b21]
- Updated dependencies [62b0877]
- Updated dependencies [e20006b]
- Updated dependencies [5ba480b]
- Updated dependencies [d6c7558]
- Updated dependencies [062afaf]
- Updated dependencies [9ceeab4]
- Updated dependencies [32958d6]
- Updated dependencies [bf835b0]
- Updated dependencies [4e2f6d8]
- Updated dependencies [32958d6]
  - @tiptap/core@3.0.1
  - @tiptap/pm@3.0.1

## 3.0.0-beta.30

### Patch Changes

- @tiptap/core@3.0.0-beta.30
- @tiptap/pm@3.0.0-beta.30

## 3.0.0-beta.29

### Patch Changes

- @tiptap/core@3.0.0-beta.29
- @tiptap/pm@3.0.0-beta.29

## 3.0.0-beta.28

### Patch Changes

- @tiptap/core@3.0.0-beta.28
- @tiptap/pm@3.0.0-beta.28

## 3.0.0-beta.27

### Patch Changes

- Updated dependencies [412e1bd]
  - @tiptap/core@3.0.0-beta.27
  - @tiptap/pm@3.0.0-beta.27

## 3.0.0-beta.26

### Patch Changes

- Updated dependencies [5ba480b]
  - @tiptap/core@3.0.0-beta.26
  - @tiptap/pm@3.0.0-beta.26

## 3.0.0-beta.25

### Patch Changes

- Updated dependencies [4e2f6d8]
  - @tiptap/core@3.0.0-beta.25
  - @tiptap/pm@3.0.0-beta.25

## 3.0.0-beta.24

### Patch Changes

- @tiptap/core@3.0.0-beta.24
- @tiptap/pm@3.0.0-beta.24

## 3.0.0-beta.23

### Patch Changes

- @tiptap/core@3.0.0-beta.23
- @tiptap/pm@3.0.0-beta.23

## 3.0.0-beta.22

### Patch Changes

- @tiptap/core@3.0.0-beta.22
- @tiptap/pm@3.0.0-beta.22

## 3.0.0-beta.21

### Patch Changes

- Updated dependencies [813674c]
- Updated dependencies [fc17b21]
  - @tiptap/core@3.0.0-beta.21
  - @tiptap/pm@3.0.0-beta.21

## 3.0.0-beta.20

### Patch Changes

- @tiptap/core@3.0.0-beta.20
- @tiptap/pm@3.0.0-beta.20

## 3.0.0-beta.19

### Patch Changes

- Updated dependencies [9ceeab4]
  - @tiptap/core@3.0.0-beta.19
  - @tiptap/pm@3.0.0-beta.19

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
