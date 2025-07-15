# Change Log

## 3.0.5

### Patch Changes

- @tiptap/extension-list@3.0.5

## 3.0.4

### Patch Changes

- @tiptap/extension-list@3.0.4

## 3.0.3

### Patch Changes

- @tiptap/extension-list@3.0.3

## 3.0.2

### Patch Changes

- @tiptap/extension-list@3.0.2

## 3.0.1

### Major Changes

- a92f4a6: We are now building packages with tsup which does not support UMD builds, please repackage if you require UMD builds
- 2c911d2: This adds all of the list packages to the `@tiptap/extension-list` package.

  ## ListKit

  The `ListKit` export allows configuring all list extensions with one extension, and is the recommended way of using the list extensions.

  ```ts
  import { ListKit } from '@tiptap/extension-list'

  new Editor({
    extensions: [
      ListKit.configure({
        bulletList: {
          HTMLAttributes: 'bullet-list',
        },
        orderedList: {
          HTMLAttributes: 'ordered-list',
        },
        listItem: {
          HTMLAttributes: 'list-item',
        },
        taskList: {
          HTMLAttributes: 'task-list',
        },
        taskItem: {
          HTMLAttributes: 'task-item',
        },
        listKeymap: {},
      }),
    ],
  })
  ```

  ## List repackaging

  Since we've moved the code out of the list extensions to the `@tiptap/extension-list` package, you can remove the following packages from your project:

  ```bash
  npm uninstall @tiptap/extension-ordered-list @tiptap/extension-bullet-list @tiptap/extension-list-keymap @tiptap/extension-list-item @tiptap/extension-task-list
  ```

  And replace them with the new `@tiptap/extension-list` package:

  ```bash
  npm install @tiptap/extension-list
  ```

  ## Want to use the extensions separately?

  For more control, you can also use the extensions separately.

  ### BulletList

  This extension adds a bullet list to the editor.

  Migrate from `@tiptap/extension-bullet-list` to `@tiptap/extension-list`:

  ```diff
  - import BulletList from '@tiptap/extension-bullet-list'
  + import { BulletList } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { BulletList } from '@tiptap/extension-list'
  ```

  ### OrderedList

  This extension adds an ordered list to the editor.

  Migrate from `@tiptap/extension-ordered-list` to `@tiptap/extension-list`:

  ```diff
  - import OrderedList from '@tiptap/extension-ordered-list'
  + import { OrderedList } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { OrderedList } from '@tiptap/extension-list'
  ```

  ### ListItem

  This extension adds a list item to the editor.

  Migrate from `@tiptap/extension-list-item` to `@tiptap/extension-list`:

  ```diff
  - import ListItem from '@tiptap/extension-list-item'
  + import { ListItem } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { ListItem } from '@tiptap/extension-list'
  ```

  ### TaskList

  This extension adds a task list to the editor.

  Migrate from `@tiptap/extension-task-list` to `@tiptap/extension-list`:

  ```diff
  - import TaskList from '@tiptap/extension-task-list'
  + import { TaskList } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { TaskList } from '@tiptap/extension-list'
  ```

  ### TaskItem

  This extension adds a task item to the editor.

  Migrate from `@tiptap/extension-task-item` to `@tiptap/extension-list`:

  ```diff
  - import TaskItem from '@tiptap/extension-task-item'
  + import { TaskItem } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { TaskItem } from '@tiptap/extension-list'
  ```

  ### ListKeymap

  This extension adds better default keybindings for lists to the editor.

  Migrate from `@tiptap/extension-list-keymap` to `@tiptap/extension-list`:

  ```diff
  - import ListKeymap from '@tiptap/extension-list-keymap'
  + import { ListKeymap } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { ListKeymap } from '@tiptap/extension-list'
  ```

### Patch Changes

- 1b4c82b: We are now using pnpm package aliases for versions to enable better version pinning for the monorepository
- 89bd9c7: Enforce type imports so that the bundler ignores TypeScript type imports when generating the index.js file of the dist directory
- 8c69002: Synced beta with stable features
- Updated dependencies [1b4c82b]
- Updated dependencies [89bd9c7]
- Updated dependencies [8c69002]
- Updated dependencies [1d4d928]
  - @tiptap/extension-list@3.0.1

## 3.0.0-beta.30

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.30

## 3.0.0-beta.29

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.29

## 3.0.0-beta.28

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.28

## 3.0.0-beta.27

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.27

## 3.0.0-beta.26

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.26

## 3.0.0-beta.25

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.25

## 3.0.0-beta.24

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.24

## 3.0.0-beta.23

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.23

## 3.0.0-beta.22

### Patch Changes

- Updated dependencies [1d4d928]
  - @tiptap/extension-list@3.0.0-beta.22

## 3.0.0-beta.21

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.21

## 3.0.0-beta.20

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.20

## 3.0.0-beta.19

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.19

## 3.0.0-beta.18

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.18

## 3.0.0-beta.17

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.17

## 3.0.0-beta.16

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.16

## 3.0.0-beta.15

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.15

## 3.0.0-beta.14

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.14

## 3.0.0-beta.13

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.13

## 3.0.0-beta.12

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.12

## 3.0.0-beta.11

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.11

## 3.0.0-beta.10

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.10

## 3.0.0-beta.9

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.9

## 3.0.0-beta.8

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.8

## 3.0.0-beta.7

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.7

## 3.0.0-beta.6

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.6

## 3.0.0-beta.5

### Patch Changes

- 8c69002: Synced beta with stable features
- Updated dependencies [8c69002]
  - @tiptap/extension-list@3.0.0-beta.5

## 3.0.0-beta.4

### Patch Changes

- @tiptap/extension-list@3.0.0-beta.4

## 3.0.0-beta.3

### Patch Changes

- 1b4c82b: We are now using pnpm package aliases for versions to enable better version pinning for the monorepository
- Updated dependencies [1b4c82b]
  - @tiptap/extension-list@3.0.0-beta.3

## 3.0.0-beta.2

## 3.0.0-beta.1

## 3.0.0-beta.0

## 3.0.0-next.8

## 3.0.0-next.7

### Patch Changes

- 89bd9c7: Enforce type imports so that the bundler ignores TypeScript type imports when generating the index.js file of the dist directory

## 3.0.0-next.6

### Major Changes

- a92f4a6: We are now building packages with tsup which does not support UMD builds, please repackage if you require UMD builds
- 2c911d2: This adds all of the list packages to the `@tiptap/extension-list` package.

  ## ListKit

  The `ListKit` export allows configuring all list extensions with one extension, and is the recommended way of using the list extensions.

  ```ts
  import { ListKit } from '@tiptap/extension-list'

  new Editor({
    extensions: [
      ListKit.configure({
        bulletList: {
          HTMLAttributes: 'bullet-list',
        },
        orderedList: {
          HTMLAttributes: 'ordered-list',
        },
        listItem: {
          HTMLAttributes: 'list-item',
        },
        taskList: {
          HTMLAttributes: 'task-list',
        },
        taskItem: {
          HTMLAttributes: 'task-item',
        },
        listKeymap: {},
      }),
    ],
  })
  ```

  ## List repackaging

  Since we've moved the code out of the list extensions to the `@tiptap/extension-list` package, you can remove the following packages from your project:

  ```bash
  npm uninstall @tiptap/extension-ordered-list @tiptap/extension-bullet-list @tiptap/extension-list-keymap @tiptap/extension-list-item @tiptap/extension-task-list
  ```

  And replace them with the new `@tiptap/extension-list` package:

  ```bash
  npm install @tiptap/extension-list
  ```

  ## Want to use the extensions separately?

  For more control, you can also use the extensions separately.

  ### BulletList

  This extension adds a bullet list to the editor.

  Migrate from `@tiptap/extension-bullet-list` to `@tiptap/extension-list`:

  ```diff
  - import BulletList from '@tiptap/extension-bullet-list'
  + import { BulletList } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { BulletList } from '@tiptap/extension-list'
  ```

  ### OrderedList

  This extension adds an ordered list to the editor.

  Migrate from `@tiptap/extension-ordered-list` to `@tiptap/extension-list`:

  ```diff
  - import OrderedList from '@tiptap/extension-ordered-list'
  + import { OrderedList } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { OrderedList } from '@tiptap/extension-list'
  ```

  ### ListItem

  This extension adds a list item to the editor.

  Migrate from `@tiptap/extension-list-item` to `@tiptap/extension-list`:

  ```diff
  - import ListItem from '@tiptap/extension-list-item'
  + import { ListItem } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { ListItem } from '@tiptap/extension-list'
  ```

  ### TaskList

  This extension adds a task list to the editor.

  Migrate from `@tiptap/extension-task-list` to `@tiptap/extension-list`:

  ```diff
  - import TaskList from '@tiptap/extension-task-list'
  + import { TaskList } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { TaskList } from '@tiptap/extension-list'
  ```

  ### TaskItem

  This extension adds a task item to the editor.

  Migrate from `@tiptap/extension-task-item` to `@tiptap/extension-list`:

  ```diff
  - import TaskItem from '@tiptap/extension-task-item'
  + import { TaskItem } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { TaskItem } from '@tiptap/extension-list'
  ```

  ### ListKeymap

  This extension adds better default keybindings for lists to the editor.

  Migrate from `@tiptap/extension-list-keymap` to `@tiptap/extension-list`:

  ```diff
  - import ListKeymap from '@tiptap/extension-list-keymap'
  + import { ListKeymap } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { ListKeymap } from '@tiptap/extension-list'
  ```

## 3.0.0-next.5

### Major Changes

- 2c911d2: This adds all of the list packages to the `@tiptap/extension-list` package.

  ## ListKit

  The `ListKit` export allows configuring all list extensions with one extension, and is the recommended way of using the list extensions.

  ```ts
  import { ListKit } from '@tiptap/extension-list'

  new Editor({
    extensions: [
      ListKit.configure({
        bulletList: {
          HTMLAttributes: 'bullet-list',
        },
        orderedList: {
          HTMLAttributes: 'ordered-list',
        },
        listItem: {
          HTMLAttributes: 'list-item',
        },
        taskList: {
          HTMLAttributes: 'task-list',
        },
        taskItem: {
          HTMLAttributes: 'task-item',
        },
        listKeymap: {},
      }),
    ],
  })
  ```

  ## List repackaging

  Since we've moved the code out of the list extensions to the `@tiptap/extension-list` package, you can remove the following packages from your project:

  ```bash
  npm uninstall @tiptap/extension-ordered-list @tiptap/extension-bullet-list @tiptap/extension-list-keymap @tiptap/extension-list-item @tiptap/extension-task-list
  ```

  And replace them with the new `@tiptap/extension-list` package:

  ```bash
  npm install @tiptap/extension-list
  ```

  ## Want to use the extensions separately?

  For more control, you can also use the extensions separately.

  ### BulletList

  This extension adds a bullet list to the editor.

  Migrate from `@tiptap/extension-bullet-list` to `@tiptap/extension-list`:

  ```diff
  - import BulletList from '@tiptap/extension-bullet-list'
  + import { BulletList } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { BulletList } from '@tiptap/extension-list'
  ```

  ### OrderedList

  This extension adds an ordered list to the editor.

  Migrate from `@tiptap/extension-ordered-list` to `@tiptap/extension-list`:

  ```diff
  - import OrderedList from '@tiptap/extension-ordered-list'
  + import { OrderedList } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { OrderedList } from '@tiptap/extension-list'
  ```

  ### ListItem

  This extension adds a list item to the editor.

  Migrate from `@tiptap/extension-list-item` to `@tiptap/extension-list`:

  ```diff
  - import ListItem from '@tiptap/extension-list-item'
  + import { ListItem } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { ListItem } from '@tiptap/extension-list'
  ```

  ### TaskList

  This extension adds a task list to the editor.

  Migrate from `@tiptap/extension-task-list` to `@tiptap/extension-list`:

  ```diff
  - import TaskList from '@tiptap/extension-task-list'
  + import { TaskList } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { TaskList } from '@tiptap/extension-list'
  ```

  ### TaskItem

  This extension adds a task item to the editor.

  Migrate from `@tiptap/extension-task-item` to `@tiptap/extension-list`:

  ```diff
  - import TaskItem from '@tiptap/extension-task-item'
  + import { TaskItem } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { TaskItem } from '@tiptap/extension-list'
  ```

  ### ListKeymap

  This extension adds better default keybindings for lists to the editor.

  Migrate from `@tiptap/extension-list-keymap` to `@tiptap/extension-list`:

  ```diff
  - import ListKeymap from '@tiptap/extension-list-keymap'
  + import { ListKeymap } from '@tiptap/extension-list'
  ```

  Usage:

  ```ts
  import { ListKeymap } from '@tiptap/extension-list'
  ```

## 3.0.0-next.4

## 3.0.0-next.3

## 3.0.0-next.2

### Patch Changes

- 86250c6: Improve selected text deletion at the end of list items

## 3.0.0-next.1

### Major Changes

- a92f4a6: We are now building packages with tsup which does not support UMD builds, please repackage if you require UMD builds

### Patch Changes

- Updated dependencies [a92f4a6]
- Updated dependencies [da76972]
  - @tiptap/core@3.0.0-next.1

## 3.0.0-next.0

### Patch Changes

- Updated dependencies [0ec0af6]
  - @tiptap/core@3.0.0-next.0

## 2.12.0

## 2.11.9

## 2.11.8

## 2.11.7

## 2.11.6

## 2.11.5

## 2.11.4

## 2.11.3

## 2.5.8

### Patch Changes

- Updated dependencies [a08bf85]
  - @tiptap/core@2.5.8

## 2.5.7

### Patch Changes

- Updated dependencies [b012471]
- Updated dependencies [cc3497e]
  - @tiptap/core@2.5.7

## 2.5.6

### Patch Changes

- Updated dependencies [618bca9]
- Updated dependencies [35682d1]
- Updated dependencies [2104f0f]
  - @tiptap/core@2.5.6

## 2.5.5

### Patch Changes

- Updated dependencies [4cca382]
- Updated dependencies [3b67e8a]
  - @tiptap/core@2.5.5

## 2.5.4

### Patch Changes

- dd7f9ac: There was an issue with the cjs bundling of packages and default exports, now we resolve default exports in legacy compatible way
- Updated dependencies [dd7f9ac]
  - @tiptap/core@2.5.4

## 2.5.3

### Patch Changes

- @tiptap/core@2.5.3

## 2.5.2

### Patch Changes

- Updated dependencies [07f4c03]
  - @tiptap/core@2.5.2

## 2.5.1

### Patch Changes

- @tiptap/core@2.5.1

## 2.5.0

### Patch Changes

- Updated dependencies [fb45149]
- Updated dependencies [fb45149]
- Updated dependencies [fb45149]
- Updated dependencies [fb45149]
  - @tiptap/core@2.5.0

## 2.5.0-pre.16

### Patch Changes

- @tiptap/core@2.5.0-pre.16

## 2.5.0-pre.15

### Patch Changes

- @tiptap/core@2.5.0-pre.15

## 2.5.0-pre.14

### Patch Changes

- @tiptap/core@2.5.0-pre.14

## 2.5.0-pre.13

### Patch Changes

- Updated dependencies [74a37ff]
  - @tiptap/core@2.5.0-pre.13

## 2.5.0-pre.12

### Patch Changes

- Updated dependencies [74a37ff]
  - @tiptap/core@2.5.0-pre.12

## 2.5.0-pre.11

### Patch Changes

- Updated dependencies [74a37ff]
  - @tiptap/core@2.5.0-pre.11

## 2.5.0-pre.10

### Patch Changes

- Updated dependencies [74a37ff]
  - @tiptap/core@2.5.0-pre.10

## 2.5.0-pre.9

### Patch Changes

- Updated dependencies [14a00f4]
  - @tiptap/core@2.5.0-pre.9

## 2.5.0-pre.8

### Patch Changes

- Updated dependencies [509676e]
  - @tiptap/core@2.5.0-pre.8

## 2.5.0-pre.7

### Patch Changes

- @tiptap/core@2.5.0-pre.7

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.4.0](https://github.com/ueberdosis/tiptap/compare/v2.3.2...v2.4.0) (2024-05-14)

### Features

- added jsdocs ([#4356](https://github.com/ueberdosis/tiptap/issues/4356)) ([b941eea](https://github.com/ueberdosis/tiptap/commit/b941eea6daba09d48a5d18ccc1b9a1d84b2249dd))

## [2.3.2](https://github.com/ueberdosis/tiptap/compare/v2.3.1...v2.3.2) (2024-05-08)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.3.1](https://github.com/ueberdosis/tiptap/compare/v2.3.0...v2.3.1) (2024-04-30)

**Note:** Version bump only for package @tiptap/extension-list-keymap

# [2.3.0](https://github.com/ueberdosis/tiptap/compare/v2.2.6...v2.3.0) (2024-04-09)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.2.6](https://github.com/ueberdosis/tiptap/compare/v2.2.5...v2.2.6) (2024-04-06)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.2.5](https://github.com/ueberdosis/tiptap/compare/v2.2.4...v2.2.5) (2024-04-05)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.2.4](https://github.com/ueberdosis/tiptap/compare/v2.2.3...v2.2.4) (2024-02-23)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.2.3](https://github.com/ueberdosis/tiptap/compare/v2.2.2...v2.2.3) (2024-02-15)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.2.2](https://github.com/ueberdosis/tiptap/compare/v2.2.1...v2.2.2) (2024-02-07)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.2.1](https://github.com/ueberdosis/tiptap/compare/v2.2.0...v2.2.1) (2024-01-31)

**Note:** Version bump only for package @tiptap/extension-list-keymap

# [2.2.0](https://github.com/ueberdosis/tiptap/compare/v2.1.16...v2.2.0) (2024-01-29)

# [2.2.0-rc.8](https://github.com/ueberdosis/tiptap/compare/v2.1.14...v2.2.0-rc.8) (2024-01-08)

# [2.2.0-rc.7](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.6...v2.2.0-rc.7) (2023-11-27)

# [2.2.0-rc.6](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.5...v2.2.0-rc.6) (2023-11-23)

# [2.2.0-rc.4](https://github.com/ueberdosis/tiptap/compare/v2.1.11...v2.2.0-rc.4) (2023-10-10)

# [2.2.0-rc.3](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.2...v2.2.0-rc.3) (2023-08-18)

# [2.2.0-rc.1](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.0...v2.2.0-rc.1) (2023-08-18)

# [2.2.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.1.5...v2.2.0-rc.0) (2023-08-18)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.16](https://github.com/ueberdosis/tiptap/compare/v2.1.15...v2.1.16) (2024-01-10)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.15](https://github.com/ueberdosis/tiptap/compare/v2.1.14...v2.1.15) (2024-01-08)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.14](https://github.com/ueberdosis/tiptap/compare/v2.1.13...v2.1.14) (2024-01-08)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.13](https://github.com/ueberdosis/tiptap/compare/v2.1.12...v2.1.13) (2023-11-30)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.12](https://github.com/ueberdosis/tiptap/compare/v2.1.11...v2.1.12) (2023-10-11)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.11](https://github.com/ueberdosis/tiptap/compare/v2.1.10...v2.1.11) (2023-09-20)

### Reverts

- Revert "v2.2.11" ([6aa755a](https://github.com/ueberdosis/tiptap/commit/6aa755a04b9955fc175c7ab33dee527d0d5deef0))

## [2.1.10](https://github.com/ueberdosis/tiptap/compare/v2.1.9...v2.1.10) (2023-09-15)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.9](https://github.com/ueberdosis/tiptap/compare/v2.1.8...v2.1.9) (2023-09-14)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.8](https://github.com/ueberdosis/tiptap/compare/v2.1.7...v2.1.8) (2023-09-04)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.7](https://github.com/ueberdosis/tiptap/compare/v2.1.6...v2.1.7) (2023-09-04)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.6](https://github.com/ueberdosis/tiptap/compare/v2.1.5...v2.1.6) (2023-08-18)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.5](https://github.com/ueberdosis/tiptap/compare/v2.1.4...v2.1.5) (2023-08-18)

### Bug Fixes

- **list-key-map:** fix broken imports ([#4350](https://github.com/ueberdosis/tiptap/issues/4350)) ([e40ac25](https://github.com/ueberdosis/tiptap/commit/e40ac2584e813893a61c91a456bdcd2cf6652b50))

## [2.1.4](https://github.com/ueberdosis/tiptap/compare/v2.1.3...v2.1.4) (2023-08-18)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.3](https://github.com/ueberdosis/tiptap/compare/v2.1.2...v2.1.3) (2023-08-18)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.2](https://github.com/ueberdosis/tiptap/compare/v2.1.1...v2.1.2) (2023-08-17)

**Note:** Version bump only for package @tiptap/extension-list-keymap

## [2.1.1](https://github.com/ueberdosis/tiptap/compare/v2.1.0...v2.1.1) (2023-08-16)

**Note:** Version bump only for package @tiptap/extension-list-keymap

# [2.1.0](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.14...v2.1.0) (2023-08-16)

**Note:** Version bump only for package @tiptap/extension-list-keymap

# [2.1.0-rc.14](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.13...v2.1.0-rc.14) (2023-08-11)

**Note:** Version bump only for package @tiptap/extension-list-keymap

# [2.1.0-rc.13](https://github.com/ueberdosis/tiptap/compare/v2.0.4...v2.1.0-rc.13) (2023-08-11)

**Note:** Version bump only for package @tiptap/extension-list-keymap
