# Change Log

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
