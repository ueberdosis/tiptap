# Change Log

## 3.16.0

### Patch Changes

- @dibdab/core@3.16.0
- @dibdab/pm@3.16.0

## 3.15.3

### Patch Changes

- Updated dependencies [8f86f06]
  - @dibdab/core@3.15.3
  - @dibdab/pm@3.15.3

## 3.15.2

### Patch Changes

- @dibdab/core@3.15.2
- @dibdab/pm@3.15.2

## 3.15.1

### Patch Changes

- @dibdab/core@3.15.1
- @dibdab/pm@3.15.1

## 3.15.0

### Patch Changes

- Updated dependencies [ac8361c]
  - @dibdab/core@3.15.0
  - @dibdab/pm@3.15.0

## 3.14.0

### Patch Changes

- @dibdab/core@3.14.0
- @dibdab/pm@3.14.0

## 3.13.0

### Patch Changes

- Updated dependencies [526365a]
- Updated dependencies [e3b4f68]
  - @dibdab/core@3.13.0
  - @dibdab/pm@3.13.0

## 3.12.1

### Patch Changes

- @dibdab/core@3.12.1
- @dibdab/pm@3.12.1

## 3.12.0

### Patch Changes

- Updated dependencies [f232c5a]
  - @dibdab/core@3.12.0
  - @dibdab/pm@3.12.0

## 3.11.1

### Patch Changes

- eea7190: Fixed a bug where the TrailingNode extension would not use the node option to assume the default node type
- Updated dependencies [d0c4264]
  - @dibdab/core@3.11.1
  - @dibdab/pm@3.11.1

## 3.11.0

### Patch Changes

- Updated dependencies [541c93c]
  - @dibdab/core@3.11.0
  - @dibdab/pm@3.11.0

## 3.10.8

### Patch Changes

- Updated dependencies [8375241]
- Updated dependencies [b7ead7c]
- Updated dependencies [95d3e80]
- Updated dependencies [fd479bd]
  - @dibdab/core@3.10.8
  - @dibdab/pm@3.10.8

## 3.10.7

### Patch Changes

- @dibdab/core@3.10.7
- @dibdab/pm@3.10.7

## 3.10.6

### Patch Changes

- @dibdab/core@3.10.6
- @dibdab/pm@3.10.6

## 3.10.5

### Patch Changes

- 9d5aeb1: Fixed infinite transaction loop that caused browser tabs to freeze when using UniqueID and TrailingNode extensions together.
- Updated dependencies [92fae18]
  - @dibdab/core@3.10.5
  - @dibdab/pm@3.10.5

## 3.10.4

### Patch Changes

- Updated dependencies [64561c4]
  - @dibdab/core@3.10.4
  - @dibdab/pm@3.10.4

## 3.10.3

### Patch Changes

- @dibdab/core@3.10.3
- @dibdab/pm@3.10.3

## 3.10.2

### Patch Changes

- @dibdab/core@3.10.2
- @dibdab/pm@3.10.2

## 3.10.1

### Patch Changes

- Updated dependencies [3564e7c]
  - @dibdab/core@3.10.1
  - @dibdab/pm@3.10.1

## 3.10.0

### Patch Changes

- Updated dependencies [4aa9f57]
- Updated dependencies [4aa9f57]
  - @dibdab/core@3.10.0
  - @dibdab/pm@3.10.0

## 3.9.1

### Patch Changes

- @dibdab/core@3.9.1
- @dibdab/pm@3.9.1

## 3.9.0

### Patch Changes

- Updated dependencies [bbb8e16]
  - @dibdab/core@3.9.0
  - @dibdab/pm@3.9.0

## 3.8.0

### Patch Changes

- @dibdab/core@3.8.0
- @dibdab/pm@3.8.0

## 3.7.2

### Patch Changes

- @dibdab/core@3.7.2
- @dibdab/pm@3.7.2

## 3.7.1

### Patch Changes

- @dibdab/core@3.7.1
- @dibdab/pm@3.7.1

## 3.7.0

### Patch Changes

- 7cf3ab6: Make the `TrailingNode` extension's `node` option optional and derive the
  default node type from the editor schema when available.

  Previously the extension used a hard-coded `'paragraph'` default and the
  `node` option was required in the TypeScript definitions. This change:

  - makes `node` optional in the options type,
  - prefers the editor schema's top node default type when resolving the
    trailing node, and
  - falls back to the configured option or `'paragraph'` as a last resort.

  This fixes cases where projects use a different top-level default node and
  prevents the extension from inserting an incorrect trailing node type.

- Updated dependencies [35645d9]
- Updated dependencies [35645d9]
- Updated dependencies [35645d9]
  - @dibdab/core@3.7.0
  - @dibdab/pm@3.7.0

## 3.6.7

### Patch Changes

- @dibdab/core@3.6.7
- @dibdab/pm@3.6.7

## 3.6.6

### Patch Changes

- @dibdab/core@3.6.6
- @dibdab/pm@3.6.6

## 3.6.5

### Patch Changes

- Updated dependencies [1e4caea]
  - @dibdab/core@3.6.5
  - @dibdab/pm@3.6.5

## 3.6.4

### Patch Changes

- @dibdab/core@3.6.4
- @dibdab/pm@3.6.4

## 3.6.3

### Patch Changes

- 7024d69: The Selection extension now uses the correct SelectionOptions type, providing accurate typings for its options.
- Updated dependencies [67f7b4a]
  - @dibdab/core@3.6.3
  - @dibdab/pm@3.6.3

## 3.6.2

### Patch Changes

- @dibdab/core@3.6.2
- @dibdab/pm@3.6.2

## 3.6.1

### Patch Changes

- @dibdab/core@3.6.1
- @dibdab/pm@3.6.1

## 3.6.0

### Patch Changes

- Updated dependencies [c0190bd]
  - @dibdab/core@3.6.0
  - @dibdab/pm@3.6.0

## 3.5.3

### Patch Changes

- @dibdab/core@3.5.3
- @dibdab/pm@3.5.3

## 3.5.2

### Patch Changes

- @dibdab/core@3.5.2
- @dibdab/pm@3.5.2

## 3.5.1

### Patch Changes

- @dibdab/core@3.5.1
- @dibdab/pm@3.5.1

## 3.5.0

### Patch Changes

- @dibdab/core@3.5.0
- @dibdab/pm@3.5.0

## 3.4.6

### Patch Changes

- Updated dependencies [968016f]
  - @dibdab/core@3.4.6
  - @dibdab/pm@3.4.6

## 3.4.5

### Patch Changes

- Updated dependencies [0226d42]
- Updated dependencies [37af83b]
- Updated dependencies [f598ac7]
  - @dibdab/core@3.4.5
  - @dibdab/pm@3.4.5

## 3.4.4

### Patch Changes

- Updated dependencies [00cf1d7]
  - @dibdab/core@3.4.4
  - @dibdab/pm@3.4.4

## 3.4.3

### Patch Changes

- Updated dependencies [1ea8906]
  - @dibdab/core@3.4.3
  - @dibdab/pm@3.4.3

## 3.4.2

### Patch Changes

- @dibdab/core@3.4.2
- @dibdab/pm@3.4.2

## 3.4.1

### Patch Changes

- @dibdab/core@3.4.1
- @dibdab/pm@3.4.1

## 3.4.0

### Patch Changes

- Updated dependencies [895c73f]
- Updated dependencies [ad51daa]
  - @dibdab/core@3.4.0
  - @dibdab/pm@3.4.0

## 3.3.1

### Patch Changes

- @dibdab/core@3.3.1
- @dibdab/pm@3.3.1

## 3.3.0

### Patch Changes

- Updated dependencies [5423726]
- Updated dependencies [5423726]
  - @dibdab/core@3.3.0
  - @dibdab/pm@3.3.0

## 3.2.2

### Patch Changes

- @dibdab/core@3.2.2
- @dibdab/pm@3.2.2

## 3.2.1

### Patch Changes

- Updated dependencies [6a2873f]
  - @dibdab/core@3.2.1
  - @dibdab/pm@3.2.1

## 3.2.0

### Patch Changes

- Updated dependencies [5056e3e]
  - @dibdab/core@3.2.0
  - @dibdab/pm@3.2.0

## 3.1.0

### Patch Changes

- @dibdab/core@3.1.0
- @dibdab/pm@3.1.0

## 3.0.9

### Patch Changes

- @dibdab/core@3.0.9
- @dibdab/pm@3.0.9

## 3.0.8

### Patch Changes

- @dibdab/core@3.0.8
- @dibdab/pm@3.0.8

## 3.0.7

### Patch Changes

- @dibdab/core@3.0.7
- @dibdab/pm@3.0.7

## 3.0.6

### Patch Changes

- Updated dependencies [2e71d05]
  - @dibdab/core@3.0.6
  - @dibdab/pm@3.0.6

## 3.0.5

### Patch Changes

- @dibdab/core@3.0.5
- @dibdab/pm@3.0.5

## 3.0.4

### Patch Changes

- Updated dependencies [7ed03fa]
  - @dibdab/core@3.0.4
  - @dibdab/pm@3.0.4

## 3.0.3

### Patch Changes

- Updated dependencies [75cabde]
  - @dibdab/core@3.0.3
  - @dibdab/pm@3.0.3

## 3.0.2

### Patch Changes

- @dibdab/core@3.0.2
- @dibdab/pm@3.0.2

## 3.0.1

### Major Changes

- bfec9b2: Adds the new `@dibdab/extensions` package which packages multiple utility extensions like `History`, `Placeholder`, `CharacterCount`, `DropCursor`, `GapCursor`, `TrailingNode`, `Focus`, and `Selection`.

  ## CharacterCount

  This extension adds a cursor that indicates where a new node will be inserted when dragging and dropping.

  Migrate from `@dibdab/extension-character-count` to `@dibdab/extensions`:

  ```diff
  - import CharacterCount from '@dibdab/extension-character-count'
  + import { CharacterCount } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { CharacterCount, CharacterCountOptions } from '@dibdab/extensions'
  ```

  ## DropCursor

  This extension adds a cursor that indicates where a new node will be inserted when dragging and dropping.

  Migrate from `@dibdab/extension-dropcursor` to `@dibdab/extensions`:

  ```diff
  - import DropCursor from '@dibdab/extension-dropcursor'
  + import { DropCursor } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { DropCursor, DropCursorOptions } from '@dibdab/extensions'
  ```

  ## GapCursor

  This extension adds a cursor that appears when you click on a place where no content is present, for example in-between nodes.

  Migrate from `@dibdab/extension-gapcursor` to `@dibdab/extensions`:

  ```diff
  - import GapCursor from '@dibdab/extension-gapcursor'
  + import { GapCursor } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { GapCursor } from '@dibdab/extensions'
  ```

  ## History

  This extension adds undo and redo functionality to the editor.

  Migrate from `@dibdab/extension-history` to `@dibdab/extensions`:

  ```diff
  - import History from '@dibdab/extension-history'
  + import { History } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { UndoRedo, UndoRedoOptions } from '@dibdab/extensions'
  ```

  ## Placeholder

  This extension adds a placeholder text to the editor, which is displayed when the editor is empty.

  Migrate from `@dibdab/extension-placeholder` to `@dibdab/extensions`:

  ```diff
  - import Placeholder from '@dibdab/extension-placeholder'
  + import { Placeholder } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { Placeholder, PlaceholderOptions } from '@dibdab/extensions'
  ```

  ## TrailingNode

  This extension adds a node at the end of the editor, which can be used to add a trailing node like a paragraph.

  ```ts
  import { TrailingNode, TrailingNodeOptions } from '@dibdab/extensions'
  ```

  ## Focus

  This extension adds a focus state to the editor, which can be used to style the editor when it's focused.

  Migrate from `@dibdab/extension-focus` to `@dibdab/extensions`:

  ```diff
  - import Focus from '@dibdab/extension-focus'
  + import { Focus } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { Focus, FocusOptions } from '@dibdab/extensions'
  ```

  ## Selection

  This extension adds a selection state to the editor, which can be used to style the editor when there's a selection.

  ```ts
  import { Selection, SelectionOptions } from '@dibdab/extensions'
  ```

- ce47182: Remove selection decoration when editor is on dragging mode

### Minor Changes

- 52b6644: skip decorations for node selection and non editable editor

### Patch Changes

- 1b4c82b: We are now using pnpm package aliases for versions to enable better version pinning for the monorepository
- 89bd9c7: Enforce type imports so that the bundler ignores TypeScript type imports when generating the index.js file of the dist directory
- 8c69002: Synced beta with stable features
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
  - @dibdab/core@3.0.1
  - @dibdab/pm@3.0.1

## 3.0.0-beta.30

### Patch Changes

- @dibdab/core@3.0.0-beta.30
- @dibdab/pm@3.0.0-beta.30

## 3.0.0-beta.29

### Patch Changes

- @dibdab/core@3.0.0-beta.29
- @dibdab/pm@3.0.0-beta.29

## 3.0.0-beta.28

### Patch Changes

- @dibdab/core@3.0.0-beta.28
- @dibdab/pm@3.0.0-beta.28

## 3.0.0-beta.27

### Major Changes

- ce47182: Remove selection decoration when editor is on dragging mode

### Patch Changes

- Updated dependencies [412e1bd]
  - @dibdab/core@3.0.0-beta.27
  - @dibdab/pm@3.0.0-beta.27

## 3.0.0-beta.26

### Patch Changes

- Updated dependencies [5ba480b]
  - @dibdab/core@3.0.0-beta.26
  - @dibdab/pm@3.0.0-beta.26

## 3.0.0-beta.25

### Patch Changes

- Updated dependencies [4e2f6d8]
  - @dibdab/core@3.0.0-beta.25
  - @dibdab/pm@3.0.0-beta.25

## 3.0.0-beta.24

### Patch Changes

- @dibdab/core@3.0.0-beta.24
- @dibdab/pm@3.0.0-beta.24

## 3.0.0-beta.23

### Patch Changes

- @dibdab/core@3.0.0-beta.23
- @dibdab/pm@3.0.0-beta.23

## 3.0.0-beta.22

### Patch Changes

- @dibdab/core@3.0.0-beta.22
- @dibdab/pm@3.0.0-beta.22

## 3.0.0-beta.21

### Patch Changes

- Updated dependencies [813674c]
- Updated dependencies [fc17b21]
  - @dibdab/core@3.0.0-beta.21
  - @dibdab/pm@3.0.0-beta.21

## 3.0.0-beta.20

### Patch Changes

- @dibdab/core@3.0.0-beta.20
- @dibdab/pm@3.0.0-beta.20

## 3.0.0-beta.19

### Patch Changes

- Updated dependencies [9ceeab4]
  - @dibdab/core@3.0.0-beta.19
  - @dibdab/pm@3.0.0-beta.19

## 3.0.0-beta.18

### Patch Changes

- @dibdab/core@3.0.0-beta.18
- @dibdab/pm@3.0.0-beta.18

## 3.0.0-beta.17

### Patch Changes

- Updated dependencies [e20006b]
  - @dibdab/core@3.0.0-beta.17
  - @dibdab/pm@3.0.0-beta.17

## 3.0.0-beta.16

### Patch Changes

- Updated dependencies [ac897e7]
- Updated dependencies [bf835b0]
  - @dibdab/core@3.0.0-beta.16
  - @dibdab/pm@3.0.0-beta.16

## 3.0.0-beta.15

### Patch Changes

- Updated dependencies [087d114]
  - @dibdab/core@3.0.0-beta.15
  - @dibdab/pm@3.0.0-beta.15

## 3.0.0-beta.14

### Patch Changes

- Updated dependencies [95b8c71]
  - @dibdab/core@3.0.0-beta.14
  - @dibdab/pm@3.0.0-beta.14

## 3.0.0-beta.13

### Patch Changes

- @dibdab/core@3.0.0-beta.13
- @dibdab/pm@3.0.0-beta.13

## 3.0.0-beta.12

### Patch Changes

- @dibdab/core@3.0.0-beta.12
- @dibdab/pm@3.0.0-beta.12

## 3.0.0-beta.11

### Patch Changes

- @dibdab/core@3.0.0-beta.11
- @dibdab/pm@3.0.0-beta.11

## 3.0.0-beta.10

### Patch Changes

- @dibdab/core@3.0.0-beta.10
- @dibdab/pm@3.0.0-beta.10

## 3.0.0-beta.9

### Patch Changes

- @dibdab/core@3.0.0-beta.9
- @dibdab/pm@3.0.0-beta.9

## 3.0.0-beta.8

### Patch Changes

- @dibdab/core@3.0.0-beta.8
- @dibdab/pm@3.0.0-beta.8

## 3.0.0-beta.7

### Patch Changes

- Updated dependencies [d0fda30]
  - @dibdab/core@3.0.0-beta.7
  - @dibdab/pm@3.0.0-beta.7

## 3.0.0-beta.6

### Patch Changes

- @dibdab/core@3.0.0-beta.6
- @dibdab/pm@3.0.0-beta.6

## 3.0.0-beta.5

### Patch Changes

- 8c69002: Synced beta with stable features
- Updated dependencies [8c69002]
- Updated dependencies [62b0877]
  - @dibdab/core@3.0.0-beta.5
  - @dibdab/pm@3.0.0-beta.5

## 3.0.0-beta.4

### Patch Changes

- Updated dependencies [5e957e5]
- Updated dependencies [9f207a6]
  - @dibdab/core@3.0.0-beta.4
  - @dibdab/pm@3.0.0-beta.4

## 3.0.0-beta.3

### Patch Changes

- 1b4c82b: We are now using pnpm package aliases for versions to enable better version pinning for the monorepository
- Updated dependencies [1b4c82b]
  - @dibdab/core@3.0.0-beta.3
  - @dibdab/pm@3.0.0-beta.3

## 3.0.0-beta.2

## 3.0.0-beta.1

## 3.0.0-beta.0

### Minor Changes

- 52b6644: skip decorations for node selection and non editable editor

## 3.0.0-next.8

## 3.0.0-next.7

### Patch Changes

- 89bd9c7: Enforce type imports so that the bundler ignores TypeScript type imports when generating the index.js file of the dist directory

## 3.0.0-next.6

### Major Changes

- bfec9b2: Adds the new `@dibdab/extensions` package which packages multiple utility extensions like `History`, `Placeholder`, `CharacterCount`, `DropCursor`, `GapCursor`, `TrailingNode`, `Focus`, and `Selection`.

  ## CharacterCount

  This extension adds a cursor that indicates where a new node will be inserted when dragging and dropping.

  Migrate from `@dibdab/extension-character-count` to `@dibdab/extensions`:

  ```diff
  - import CharacterCount from '@dibdab/extension-character-count'
  + import { CharacterCount } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { CharacterCount, CharacterCountOptions } from '@dibdab/extensions'
  ```

  ## DropCursor

  This extension adds a cursor that indicates where a new node will be inserted when dragging and dropping.

  Migrate from `@dibdab/extension-dropcursor` to `@dibdab/extensions`:

  ```diff
  - import DropCursor from '@dibdab/extension-dropcursor'
  + import { DropCursor } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { DropCursor, DropCursorOptions } from '@dibdab/extensions'
  ```

  ## GapCursor

  This extension adds a cursor that appears when you click on a place where no content is present, for example in-between nodes.

  Migrate from `@dibdab/extension-gapcursor` to `@dibdab/extensions`:

  ```diff
  - import GapCursor from '@dibdab/extension-gapcursor'
  + import { GapCursor } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { GapCursor } from '@dibdab/extensions'
  ```

  ## History

  This extension adds undo and redo functionality to the editor.

  Migrate from `@dibdab/extension-history` to `@dibdab/extensions`:

  ```diff
  - import History from '@dibdab/extension-history'
  + import { History } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { History, HistoryOptions } from '@dibdab/extensions'
  ```

  ## Placeholder

  This extension adds a placeholder text to the editor, which is displayed when the editor is empty.

  Migrate from `@dibdab/extension-placeholder` to `@dibdab/extensions`:

  ```diff
  - import Placeholder from '@dibdab/extension-placeholder'
  + import { Placeholder } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { Placeholder, PlaceholderOptions } from '@dibdab/extensions'
  ```

  ## TrailingNode

  This extension adds a node at the end of the editor, which can be used to add a trailing node like a paragraph.

  ```ts
  import { TrailingNode, TrailingNodeOptions } from '@dibdab/extensions'
  ```

  ## Focus

  This extension adds a focus state to the editor, which can be used to style the editor when it's focused.

  Migrate from `@dibdab/extension-focus` to `@dibdab/extensions`:

  ```diff
  - import Focus from '@dibdab/extension-focus'
  + import { Focus } from '@dibdab/extensions'
  ```

  Usage:

  ```ts
  import { Focus, FocusOptions } from '@dibdab/extensions'
  ```

  ## Selection

  This extension adds a selection state to the editor, which can be used to style the editor when there's a selection.

  ```ts
  import { Selection, SelectionOptions } from '@dibdab/extensions'
  ```

## 3.0.0-next.5

## 3.0.0-next.4

### Major Changes

- bfec9b2: Adds the new `@dibdab/extensions` package which holds utility extensions
