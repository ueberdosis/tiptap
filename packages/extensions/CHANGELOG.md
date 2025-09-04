# Change Log

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

- bfec9b2: Adds the new `@tiptap/extensions` package which packages multiple utility extensions like `History`, `Placeholder`, `CharacterCount`, `DropCursor`, `GapCursor`, `TrailingNode`, `Focus`, and `Selection`.

  ## CharacterCount

  This extension adds a cursor that indicates where a new node will be inserted when dragging and dropping.

  Migrate from `@tiptap/extension-character-count` to `@tiptap/extensions`:

  ```diff
  - import CharacterCount from '@tiptap/extension-character-count'
  + import { CharacterCount } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { CharacterCount, CharacterCountOptions } from '@tiptap/extensions'
  ```

  ## DropCursor

  This extension adds a cursor that indicates where a new node will be inserted when dragging and dropping.

  Migrate from `@tiptap/extension-dropcursor` to `@tiptap/extensions`:

  ```diff
  - import DropCursor from '@tiptap/extension-dropcursor'
  + import { DropCursor } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { DropCursor, DropCursorOptions } from '@tiptap/extensions'
  ```

  ## GapCursor

  This extension adds a cursor that appears when you click on a place where no content is present, for example in-between nodes.

  Migrate from `@tiptap/extension-gapcursor` to `@tiptap/extensions`:

  ```diff
  - import GapCursor from '@tiptap/extension-gapcursor'
  + import { GapCursor } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { GapCursor } from '@tiptap/extensions'
  ```

  ## History

  This extension adds undo and redo functionality to the editor.

  Migrate from `@tiptap/extension-history` to `@tiptap/extensions`:

  ```diff
  - import History from '@tiptap/extension-history'
  + import { History } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { UndoRedo, UndoRedoOptions } from '@tiptap/extensions'
  ```

  ## Placeholder

  This extension adds a placeholder text to the editor, which is displayed when the editor is empty.

  Migrate from `@tiptap/extension-placeholder` to `@tiptap/extensions`:

  ```diff
  - import Placeholder from '@tiptap/extension-placeholder'
  + import { Placeholder } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { Placeholder, PlaceholderOptions } from '@tiptap/extensions'
  ```

  ## TrailingNode

  This extension adds a node at the end of the editor, which can be used to add a trailing node like a paragraph.

  ```ts
  import { TrailingNode, TrailingNodeOptions } from '@tiptap/extensions'
  ```

  ## Focus

  This extension adds a focus state to the editor, which can be used to style the editor when it's focused.

  Migrate from `@tiptap/extension-focus` to `@tiptap/extensions`:

  ```diff
  - import Focus from '@tiptap/extension-focus'
  + import { Focus } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { Focus, FocusOptions } from '@tiptap/extensions'
  ```

  ## Selection

  This extension adds a selection state to the editor, which can be used to style the editor when there's a selection.

  ```ts
  import { Selection, SelectionOptions } from '@tiptap/extensions'
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

### Major Changes

- ce47182: Remove selection decoration when editor is on dragging mode

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

### Patch Changes

- @tiptap/core@3.0.0-beta.18
- @tiptap/pm@3.0.0-beta.18

## 3.0.0-beta.17

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

### Patch Changes

- @tiptap/core@3.0.0-beta.10
- @tiptap/pm@3.0.0-beta.10

## 3.0.0-beta.9

### Patch Changes

- @tiptap/core@3.0.0-beta.9
- @tiptap/pm@3.0.0-beta.9

## 3.0.0-beta.8

### Patch Changes

- @tiptap/core@3.0.0-beta.8
- @tiptap/pm@3.0.0-beta.8

## 3.0.0-beta.7

### Patch Changes

- Updated dependencies [d0fda30]
  - @tiptap/core@3.0.0-beta.7
  - @tiptap/pm@3.0.0-beta.7

## 3.0.0-beta.6

### Patch Changes

- @tiptap/core@3.0.0-beta.6
- @tiptap/pm@3.0.0-beta.6

## 3.0.0-beta.5

### Patch Changes

- 8c69002: Synced beta with stable features
- Updated dependencies [8c69002]
- Updated dependencies [62b0877]
  - @tiptap/core@3.0.0-beta.5
  - @tiptap/pm@3.0.0-beta.5

## 3.0.0-beta.4

### Patch Changes

- Updated dependencies [5e957e5]
- Updated dependencies [9f207a6]
  - @tiptap/core@3.0.0-beta.4
  - @tiptap/pm@3.0.0-beta.4

## 3.0.0-beta.3

### Patch Changes

- 1b4c82b: We are now using pnpm package aliases for versions to enable better version pinning for the monorepository
- Updated dependencies [1b4c82b]
  - @tiptap/core@3.0.0-beta.3
  - @tiptap/pm@3.0.0-beta.3

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

- bfec9b2: Adds the new `@tiptap/extensions` package which packages multiple utility extensions like `History`, `Placeholder`, `CharacterCount`, `DropCursor`, `GapCursor`, `TrailingNode`, `Focus`, and `Selection`.

  ## CharacterCount

  This extension adds a cursor that indicates where a new node will be inserted when dragging and dropping.

  Migrate from `@tiptap/extension-character-count` to `@tiptap/extensions`:

  ```diff
  - import CharacterCount from '@tiptap/extension-character-count'
  + import { CharacterCount } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { CharacterCount, CharacterCountOptions } from '@tiptap/extensions'
  ```

  ## DropCursor

  This extension adds a cursor that indicates where a new node will be inserted when dragging and dropping.

  Migrate from `@tiptap/extension-dropcursor` to `@tiptap/extensions`:

  ```diff
  - import DropCursor from '@tiptap/extension-dropcursor'
  + import { DropCursor } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { DropCursor, DropCursorOptions } from '@tiptap/extensions'
  ```

  ## GapCursor

  This extension adds a cursor that appears when you click on a place where no content is present, for example in-between nodes.

  Migrate from `@tiptap/extension-gapcursor` to `@tiptap/extensions`:

  ```diff
  - import GapCursor from '@tiptap/extension-gapcursor'
  + import { GapCursor } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { GapCursor } from '@tiptap/extensions'
  ```

  ## History

  This extension adds undo and redo functionality to the editor.

  Migrate from `@tiptap/extension-history` to `@tiptap/extensions`:

  ```diff
  - import History from '@tiptap/extension-history'
  + import { History } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { History, HistoryOptions } from '@tiptap/extensions'
  ```

  ## Placeholder

  This extension adds a placeholder text to the editor, which is displayed when the editor is empty.

  Migrate from `@tiptap/extension-placeholder` to `@tiptap/extensions`:

  ```diff
  - import Placeholder from '@tiptap/extension-placeholder'
  + import { Placeholder } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { Placeholder, PlaceholderOptions } from '@tiptap/extensions'
  ```

  ## TrailingNode

  This extension adds a node at the end of the editor, which can be used to add a trailing node like a paragraph.

  ```ts
  import { TrailingNode, TrailingNodeOptions } from '@tiptap/extensions'
  ```

  ## Focus

  This extension adds a focus state to the editor, which can be used to style the editor when it's focused.

  Migrate from `@tiptap/extension-focus` to `@tiptap/extensions`:

  ```diff
  - import Focus from '@tiptap/extension-focus'
  + import { Focus } from '@tiptap/extensions'
  ```

  Usage:

  ```ts
  import { Focus, FocusOptions } from '@tiptap/extensions'
  ```

  ## Selection

  This extension adds a selection state to the editor, which can be used to style the editor when there's a selection.

  ```ts
  import { Selection, SelectionOptions } from '@tiptap/extensions'
  ```

## 3.0.0-next.5

## 3.0.0-next.4

### Major Changes

- bfec9b2: Adds the new `@tiptap/extensions` package which holds utility extensions
