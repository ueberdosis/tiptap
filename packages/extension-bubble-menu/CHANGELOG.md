# Change Log

## 3.0.9

### Patch Changes

- e011d5d: Add appendTo option
  - @tiptap/core@3.0.9
  - @tiptap/pm@3.0.9

## 3.0.8

### Patch Changes

- @tiptap/core@3.0.8
- @tiptap/pm@3.0.8

## 3.0.7

### Patch Changes

- 6b42853: Fix: Fix a problem with the inline option and virtual elements missing getClientRects
  - @tiptap/core@3.0.7
  - @tiptap/pm@3.0.7

## 3.0.6

### Patch Changes

- Updated dependencies [2e71d05]
  - @tiptap/core@3.0.6
  - @tiptap/pm@3.0.6

## 3.0.5

### Patch Changes

- f8a4e3e: Refactor: Make shouldShow optional on bubbleMenu and floatingMenu options
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

- 601b1f6: Fix: Correctly pass through the bubble menu floating options
- 601b1f6: Improvement: Added better JSDocs for the options object
  - @tiptap/core@3.0.2
  - @tiptap/pm@3.0.2

## 3.0.1

### Major Changes

- a92f4a6: We are now building packages with tsup which does not support UMD builds, please repackage if you require UMD builds
- 7eaa34d: Removed tippy.js and replaced it with [Floating UI](https://floating-ui.com/) - a newer, more lightweight and customizable floating element library.

  This change is breaking existing menu implementations and will require a manual migration.

  **Affected packages:**

  - `@tiptap/extension-floating-menu`
  - `@tiptap/extension-bubble-menu`
  - `@tiptap/extension-mention`
  - `@tiptap/suggestion`
  - `@tiptap/react`
  - `@tiptap/vue-2`
  - `@tiptap/vue-3`

  Make sure to remove `tippyOptions` from the `FloatingMenu` and `BubbleMenu` components, and replace them with the new `options` object. Check our documentation to see how to migrate your existing menu implementations.

  - [FloatingMenu](https://tiptap.dev/docs/editor/extensions/functionality/floatingmenu)
  - [BubbleMenu](https://tiptap.dev/docs/editor/extensions/functionality/bubble-menu)

  You'll also need to install `@floating-ui/dom` as a peer dependency to your project like this:

  ```bash
  npm install @floating-ui/dom@^1.6.0
  ```

  The new `options` object is compatible with all components that use these extensions.

### Patch Changes

- 1b4c82b: We are now using pnpm package aliases for versions to enable better version pinning for the monorepository
- 89bd9c7: Enforce type imports so that the bundler ignores TypeScript type imports when generating the index.js file of the dist directory
- 00693b8: Fixed a bug where table cell selections would not position the bubble menu accordingly
- 73d1888: Fixed a bug where the global resize handler of the BubbleMenu plugin would not be unregistered on destroy
- 1d4d928: Added `tab-index="0"` to menu wrappers
- 8c69002: Synced beta with stable features
- 0f14cc5: Added missing `onShow`, `onUpdate`, `onHide` and `onDestroy` options
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

- 1d4d928: Added `tab-index="0"` to menu wrappers
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

- 73d1888: Fixed a bug where the global resize handler of the BubbleMenu plugin would not be unregistered on destroy
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

- 00693b8: Fixed a bug where table cell selections would not position the bubble menu accordingly
  - @tiptap/core@3.0.0-beta.12
  - @tiptap/pm@3.0.0-beta.12

## 3.0.0-beta.11

### Patch Changes

- 0f14cc5: Added missing `onShow`, `onUpdate`, `onHide` and `onDestroy` options
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

## 3.0.0-next.8

## 3.0.0-next.7

### Patch Changes

- 89bd9c7: Enforce type imports so that the bundler ignores TypeScript type imports when generating the index.js file of the dist directory

## 3.0.0-next.6

### Major Changes

- a92f4a6: We are now building packages with tsup which does not support UMD builds, please repackage if you require UMD builds
- 7eaa34d: Removed tippy.js and replaced it with [Floating UI](https://floating-ui.com/) - a newer, more lightweight and customizable floating element library.

  This change is breaking existing menu implementations and will require a manual migration.

  **Affected packages:**

  - `@tiptap/extension-floating-menu`
  - `@tiptap/extension-bubble-menu`
  - `@tiptap/extension-mention`
  - `@tiptap/suggestion`
  - `@tiptap/react`
  - `@tiptap/vue-2`
  - `@tiptap/vue-3`

  Make sure to remove `tippyOptions` from the `FloatingMenu` and `BubbleMenu` components, and replace them with the new `options` object. Check our documentation to see how to migrate your existing menu implementations.

  - [FloatingMenu](https://tiptap.dev/docs/editor/extensions/functionality/floatingmenu)
  - [BubbleMenu](https://tiptap.dev/docs/editor/extensions/functionality/bubble-menu)

  You'll also need to install `@floating-ui/dom` as a peer dependency to your project like this:

  ```bash
  npm install @floating-ui/dom@^1.6.0
  ```

  The new `options` object is compatible with all components that use these extensions.

## 3.0.0-next.5

## 3.0.0-next.4

## 3.0.0-next.3

## 3.0.0-next.2

## 3.0.0-next.1

### Major Changes

- a92f4a6: We are now building packages with tsup which does not support UMD builds, please repackage if you require UMD builds

### Patch Changes

- Updated dependencies [a92f4a6]
- Updated dependencies [da76972]
  - @tiptap/core@3.0.0-next.1
  - @tiptap/pm@3.0.0-next.1

## 3.0.0-next.0

### Major Changes

- 7eaa34d: Removed tippy.js and replaced it with [Floating UI](https://floating-ui.com/) - a newer, more lightweight and customizable floating element library.

  This change is breaking existing menu implementations and will require a manual migration.

  **Affected packages:**

  - `@tiptap/extension-floating-menu`
  - `@tiptap/extension-bubble-menu`
  - `@tiptap/extension-mention`
  - `@tiptap/suggestion`
  - `@tiptap/react`
  - `@tiptap/vue-2`
  - `@tiptap/vue-3`

  Make sure to remove `tippyOptions` from the `FloatingMenu` and `BubbleMenu` components, and replace them with the new `options` object. Check our documentation to see how to migrate your existing menu implementations.

  - [FloatingMenu](https://tiptap.dev/docs/editor/extensions/functionality/floatingmenu)
  - [BubbleMenu](https://tiptap.dev/docs/editor/extensions/functionality/bubble-menu)

  You'll also need to install `@floating-ui/dom` as a peer dependency to your project like this:

  ```bash
  npm install @floating-ui/dom@^1.6.0
  ```

  The new `options` object is compatible with all components that use these extensions.

### Patch Changes

- Updated dependencies [0ec0af6]
  - @tiptap/core@3.0.0-next.0
  - @tiptap/pm@3.0.0-next.0

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
  - @tiptap/pm@2.5.8

## 2.5.7

### Patch Changes

- Updated dependencies [b012471]
- Updated dependencies [cc3497e]
  - @tiptap/core@2.5.7
  - @tiptap/pm@2.5.7

## 2.5.6

### Patch Changes

- Updated dependencies [b5c1b32]
- Updated dependencies [618bca9]
- Updated dependencies [35682d1]
- Updated dependencies [2104f0f]
  - @tiptap/pm@2.5.6
  - @tiptap/core@2.5.6

## 2.5.5

### Patch Changes

- Updated dependencies [4cca382]
- Updated dependencies [3b67e8a]
  - @tiptap/core@2.5.5
  - @tiptap/pm@2.5.5

## 2.5.4

### Patch Changes

- dd7f9ac: There was an issue with the cjs bundling of packages and default exports, now we resolve default exports in legacy compatible way
- Updated dependencies [dd7f9ac]
  - @tiptap/core@2.5.4
  - @tiptap/pm@2.5.4

## 2.5.3

### Patch Changes

- @tiptap/core@2.5.3
- @tiptap/pm@2.5.3

## 2.5.2

### Patch Changes

- Updated dependencies [07f4c03]
  - @tiptap/core@2.5.2
  - @tiptap/pm@2.5.2

## 2.5.1

### Patch Changes

- @tiptap/core@2.5.1
- @tiptap/pm@2.5.1

## 2.5.0

### Patch Changes

- Updated dependencies [fb45149]
- Updated dependencies [fb45149]
- Updated dependencies [fb45149]
- Updated dependencies [fb45149]
  - @tiptap/core@2.5.0
  - @tiptap/pm@2.5.0

## 2.5.0-pre.16

### Patch Changes

- @tiptap/core@2.5.0-pre.16
- @tiptap/pm@2.5.0-pre.16

## 2.5.0-pre.15

### Patch Changes

- @tiptap/core@2.5.0-pre.15
- @tiptap/pm@2.5.0-pre.15

## 2.5.0-pre.14

### Patch Changes

- @tiptap/core@2.5.0-pre.14
- @tiptap/pm@2.5.0-pre.14

## 2.5.0-pre.13

### Patch Changes

- Updated dependencies [74a37ff]
  - @tiptap/core@2.5.0-pre.13
  - @tiptap/pm@2.5.0-pre.13

## 2.5.0-pre.12

### Patch Changes

- Updated dependencies [74a37ff]
  - @tiptap/core@2.5.0-pre.12
  - @tiptap/pm@2.5.0-pre.12

## 2.5.0-pre.11

### Patch Changes

- Updated dependencies [74a37ff]
  - @tiptap/core@2.5.0-pre.11
  - @tiptap/pm@2.5.0-pre.11

## 2.5.0-pre.10

### Patch Changes

- Updated dependencies [74a37ff]
  - @tiptap/core@2.5.0-pre.10
  - @tiptap/pm@2.5.0-pre.10

## 2.5.0-pre.9

### Patch Changes

- Updated dependencies [14a00f4]
  - @tiptap/core@2.5.0-pre.9
  - @tiptap/pm@2.5.0-pre.9

## 2.5.0-pre.8

### Patch Changes

- Updated dependencies [509676e]
  - @tiptap/core@2.5.0-pre.8
  - @tiptap/pm@2.5.0-pre.8

## 2.5.0-pre.7

### Patch Changes

- @tiptap/core@2.5.0-pre.7
- @tiptap/pm@2.5.0-pre.7

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.4.0](https://github.com/ueberdosis/tiptap/compare/v2.3.2...v2.4.0) (2024-05-14)

### Features

- added jsdocs ([#4356](https://github.com/ueberdosis/tiptap/issues/4356)) ([b941eea](https://github.com/ueberdosis/tiptap/commit/b941eea6daba09d48a5d18ccc1b9a1d84b2249dd))

## [2.3.2](https://github.com/ueberdosis/tiptap/compare/v2.3.1...v2.3.2) (2024-05-08)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.3.1](https://github.com/ueberdosis/tiptap/compare/v2.3.0...v2.3.1) (2024-04-30)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.3.0](https://github.com/ueberdosis/tiptap/compare/v2.2.6...v2.3.0) (2024-04-09)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.2.6](https://github.com/ueberdosis/tiptap/compare/v2.2.5...v2.2.6) (2024-04-06)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.2.5](https://github.com/ueberdosis/tiptap/compare/v2.2.4...v2.2.5) (2024-04-05)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.2.4](https://github.com/ueberdosis/tiptap/compare/v2.2.3...v2.2.4) (2024-02-23)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.2.3](https://github.com/ueberdosis/tiptap/compare/v2.2.2...v2.2.3) (2024-02-15)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.2.2](https://github.com/ueberdosis/tiptap/compare/v2.2.1...v2.2.2) (2024-02-07)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.2.1](https://github.com/ueberdosis/tiptap/compare/v2.2.0...v2.2.1) (2024-01-31)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.2.0](https://github.com/ueberdosis/tiptap/compare/v2.1.16...v2.2.0) (2024-01-29)

# [2.2.0-rc.8](https://github.com/ueberdosis/tiptap/compare/v2.1.14...v2.2.0-rc.8) (2024-01-08)

# [2.2.0-rc.7](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.6...v2.2.0-rc.7) (2023-11-27)

# [2.2.0-rc.6](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.5...v2.2.0-rc.6) (2023-11-23)

# [2.2.0-rc.4](https://github.com/ueberdosis/tiptap/compare/v2.1.11...v2.2.0-rc.4) (2023-10-10)

# [2.2.0-rc.3](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.2...v2.2.0-rc.3) (2023-08-18)

# [2.2.0-rc.1](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.0...v2.2.0-rc.1) (2023-08-18)

# [2.2.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.1.5...v2.2.0-rc.0) (2023-08-18)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.16](https://github.com/ueberdosis/tiptap/compare/v2.1.15...v2.1.16) (2024-01-10)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.15](https://github.com/ueberdosis/tiptap/compare/v2.1.14...v2.1.15) (2024-01-08)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.14](https://github.com/ueberdosis/tiptap/compare/v2.1.13...v2.1.14) (2024-01-08)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.13](https://github.com/ueberdosis/tiptap/compare/v2.1.12...v2.1.13) (2023-11-30)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.12](https://github.com/ueberdosis/tiptap/compare/v2.1.11...v2.1.12) (2023-10-11)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.11](https://github.com/ueberdosis/tiptap/compare/v2.1.10...v2.1.11) (2023-09-20)

### Reverts

- Revert "v2.2.11" ([6aa755a](https://github.com/ueberdosis/tiptap/commit/6aa755a04b9955fc175c7ab33dee527d0d5deef0))

## [2.1.10](https://github.com/ueberdosis/tiptap/compare/v2.1.9...v2.1.10) (2023-09-15)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.9](https://github.com/ueberdosis/tiptap/compare/v2.1.8...v2.1.9) (2023-09-14)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.8](https://github.com/ueberdosis/tiptap/compare/v2.1.7...v2.1.8) (2023-09-04)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.7](https://github.com/ueberdosis/tiptap/compare/v2.1.6...v2.1.7) (2023-09-04)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.6](https://github.com/ueberdosis/tiptap/compare/v2.1.5...v2.1.6) (2023-08-18)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.5](https://github.com/ueberdosis/tiptap/compare/v2.1.4...v2.1.5) (2023-08-18)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.4](https://github.com/ueberdosis/tiptap/compare/v2.1.3...v2.1.4) (2023-08-18)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.3](https://github.com/ueberdosis/tiptap/compare/v2.1.2...v2.1.3) (2023-08-18)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.2](https://github.com/ueberdosis/tiptap/compare/v2.1.1...v2.1.2) (2023-08-17)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.1.1](https://github.com/ueberdosis/tiptap/compare/v2.1.0...v2.1.1) (2023-08-16)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.14...v2.1.0) (2023-08-16)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.14](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.13...v2.1.0-rc.14) (2023-08-11)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.13](https://github.com/ueberdosis/tiptap/compare/v2.0.4...v2.1.0-rc.13) (2023-08-11)

# [2.1.0-rc.12](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.11...v2.1.0-rc.12) (2023-07-14)

# [2.1.0-rc.11](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.10...v2.1.0-rc.11) (2023-07-07)

# [2.1.0-rc.10](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.9...v2.1.0-rc.10) (2023-07-07)

# [2.1.0-rc.9](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.8...v2.1.0-rc.9) (2023-06-15)

# [2.1.0-rc.8](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.7...v2.1.0-rc.8) (2023-05-25)

# [2.1.0-rc.5](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.4...v2.1.0-rc.5) (2023-05-25)

# [2.1.0-rc.4](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.3...v2.1.0-rc.4) (2023-04-27)

# [2.1.0-rc.3](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.2...v2.1.0-rc.3) (2023-04-26)

# [2.1.0-rc.2](https://github.com/ueberdosis/tiptap/compare/v2.0.3...v2.1.0-rc.2) (2023-04-26)

# [2.1.0-rc.1](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.0...v2.1.0-rc.1) (2023-04-12)

### Bug Fixes

- **bubble-menu:** fix debounce not working with collab/collaboration cursor ([#3956](https://github.com/ueberdosis/tiptap/issues/3956)) ([e8cef04](https://github.com/ueberdosis/tiptap/commit/e8cef0404b5039ec2657536976b8b31931afd337))

# [2.1.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.0.2...v2.1.0-rc.0) (2023-04-05)

### Bug Fixes

- Update peerDependencies to fix lerna version tasks ([#3914](https://github.com/ueberdosis/tiptap/issues/3914)) ([0c1bba3](https://github.com/ueberdosis/tiptap/commit/0c1bba3137b535776bcef95ff3c55e13f5a2db46))

# [2.1.0-rc.12](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.11...v2.1.0-rc.12) (2023-07-14)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.11](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.10...v2.1.0-rc.11) (2023-07-07)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.10](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.9...v2.1.0-rc.10) (2023-07-07)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.9](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.8...v2.1.0-rc.9) (2023-06-15)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.8](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.7...v2.1.0-rc.8) (2023-05-25)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.7](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.6...v2.1.0-rc.7) (2023-05-25)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.6](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.5...v2.1.0-rc.6) (2023-05-25)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.5](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.4...v2.1.0-rc.5) (2023-05-25)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.4](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.3...v2.1.0-rc.4) (2023-04-27)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.3](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.2...v2.1.0-rc.3) (2023-04-26)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.1.0-rc.2](https://github.com/ueberdosis/tiptap/compare/v2.0.3...v2.1.0-rc.2) (2023-04-26)

# [2.1.0-rc.1](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.0...v2.1.0-rc.1) (2023-04-12)

### Bug Fixes

- **bubble-menu:** fix debounce not working with collab/collaboration cursor ([#3956](https://github.com/ueberdosis/tiptap/issues/3956)) ([e8cef04](https://github.com/ueberdosis/tiptap/commit/e8cef0404b5039ec2657536976b8b31931afd337))

# [2.1.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.0.2...v2.1.0-rc.0) (2023-04-05)

### Bug Fixes

- Update peerDependencies to fix lerna version tasks ([#3914](https://github.com/ueberdosis/tiptap/issues/3914)) ([0c1bba3](https://github.com/ueberdosis/tiptap/commit/0c1bba3137b535776bcef95ff3c55e13f5a2db46))

# [2.1.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.0.2...v2.1.0-rc.0) (2023-04-05)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.0.3](https://github.com/ueberdosis/tiptap/compare/v2.0.2...v2.0.3) (2023-04-13)

### Bug Fixes

- **bubble-menu:** fix debounce not working with collab/collaboration cursor ([#3956](https://github.com/ueberdosis/tiptap/issues/3956)) ([e8cef04](https://github.com/ueberdosis/tiptap/commit/e8cef0404b5039ec2657536976b8b31931afd337))

## [2.0.2](https://github.com/ueberdosis/tiptap/compare/v2.0.1...v2.0.2) (2023-04-03)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

## [2.0.1](https://github.com/ueberdosis/tiptap/compare/v2.0.0...v2.0.1) (2023-03-30)

### Bug Fixes

- Update peerDependencies to fix lerna version tasks ([#3914](https://github.com/ueberdosis/tiptap/issues/3914)) ([0534f76](https://github.com/ueberdosis/tiptap/commit/0534f76401bf5399c01ca7f39d87f7221d91b4f7))

# [2.0.0-beta.220](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.219...v2.0.0-beta.220) (2023-02-28)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.219](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.218...v2.0.0-beta.219) (2023-02-27)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.218](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.217...v2.0.0-beta.218) (2023-02-18)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.217](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.216...v2.0.0-beta.217) (2023-02-09)

### Bug Fixes

- **bubble-menu:** exclude lodash/debounce from externals ([516f28f](https://github.com/ueberdosis/tiptap/commit/516f28f788651b88a03136220334b6dd0f8b235f))

# [2.0.0-beta.216](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.215...v2.0.0-beta.216) (2023-02-08)

### Bug Fixes

- **bubble-menu:** fix lodash import ([06a3d63](https://github.com/ueberdosis/tiptap/commit/06a3d6300d9debcd4cfc70f5717cfaf9ae988a3c))

# [2.0.0-beta.215](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.214...v2.0.0-beta.215) (2023-02-08)

### Bug Fixes

- fix builds including prosemirror ([a380ec4](https://github.com/ueberdosis/tiptap/commit/a380ec41d198ebacc80cea9e79b0a8aa3092618a))

# [2.0.0-beta.214](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.213...v2.0.0-beta.214) (2023-02-08)

### Bug Fixes

- **bubble-menu:** move from lodash-es back to lodash, use named import ([e958128](https://github.com/ueberdosis/tiptap/commit/e9581283af8f491926a338fb572c69700861dd84))

# [2.0.0-beta.213](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.212...v2.0.0-beta.213) (2023-02-07)

### Bug Fixes

- **bubble-menu:** change lodash to lodash-es for esbuild ([2d7661c](https://github.com/ueberdosis/tiptap/commit/2d7661c910a76f1d362728a48a3c3a09236a2b00))

# [2.0.0-beta.212](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.211...v2.0.0-beta.212) (2023-02-03)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.211](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.210...v2.0.0-beta.211) (2023-02-02)

### Bug Fixes

- **bubble-menu:** fix bubble menu imports ([1e6f238](https://github.com/ueberdosis/tiptap/commit/1e6f2382eb6669269eea892c8eed4727102f2653))

# [2.0.0-beta.210](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.209...v2.0.0-beta.210) (2023-02-02)

### Features

- **pm:** new prosemirror package for dependency resolving ([f387ad3](https://github.com/ueberdosis/tiptap/commit/f387ad3dd4c2b30eaea33fb0ba0b42e0cd39263b))

# [2.0.0-beta.209](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.208...v2.0.0-beta.209) (2022-12-16)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.208](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.207...v2.0.0-beta.208) (2022-12-16)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.207](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.206...v2.0.0-beta.207) (2022-12-08)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.206](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.205...v2.0.0-beta.206) (2022-12-08)

### Bug Fixes

- **extension-bubble-menu:** don't debounce without valid selection ([#3501](https://github.com/ueberdosis/tiptap/issues/3501)) ([e9d9d88](https://github.com/ueberdosis/tiptap/commit/e9d9d8851189f936b01db7ec41fef4f4c5021761))

# [2.0.0-beta.205](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.204...v2.0.0-beta.205) (2022-12-05)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.204](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.203...v2.0.0-beta.204) (2022-11-25)

### Bug Fixes

- **core:** rename esm modules to esm.js ([c1a0c3a](https://github.com/ueberdosis/tiptap/commit/c1a0c3ae43baac9dd5ed90903d3a0d4eaeea7702))

# [2.0.0-beta.203](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.202...v2.0.0-beta.203) (2022-11-24)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.202](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.201...v2.0.0-beta.202) (2022-11-04)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.201](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.200...v2.0.0-beta.201) (2022-11-04)

### Bug Fixes

- remove blur event listener from tippy element ([#3365](https://github.com/ueberdosis/tiptap/issues/3365)) ([#3366](https://github.com/ueberdosis/tiptap/issues/3366)) ([aca6c88](https://github.com/ueberdosis/tiptap/commit/aca6c88f2de7d33d9b12a39fa82f59762d355603))

# [2.0.0-beta.200](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.199...v2.0.0-beta.200) (2022-11-04)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.199](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.198...v2.0.0-beta.199) (2022-09-30)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.198](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.197...v2.0.0-beta.198) (2022-09-29)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.197](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.196...v2.0.0-beta.197) (2022-09-26)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.196](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.195...v2.0.0-beta.196) (2022-09-20)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.195](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.194...v2.0.0-beta.195) (2022-09-14)

### Bug Fixes

- **extension/bubble-menu:** :bug: fix bubble menu and floating menu being available when editor not editable ([#3195](https://github.com/ueberdosis/tiptap/issues/3195)) ([fa96749](https://github.com/ueberdosis/tiptap/commit/fa96749ce22ec67125da491cfeeb38623b9f0d6e))

# [2.0.0-beta.194](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.193...v2.0.0-beta.194) (2022-09-11)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.62](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.61...@tiptap/extension-bubble-menu@2.0.0-beta.62) (2022-09-03)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.61](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.60...@tiptap/extension-bubble-menu@2.0.0-beta.61) (2022-06-27)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.60](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.59...@tiptap/extension-bubble-menu@2.0.0-beta.60) (2022-06-20)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.59](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.57...@tiptap/extension-bubble-menu@2.0.0-beta.59) (2022-06-17)

### Reverts

- Revert "Publish" ([9c38d27](https://github.com/ueberdosis/tiptap/commit/9c38d2713e6feac5645ad9c1bfc57abdbf054576))

# [2.0.0-beta.57](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.57...@tiptap/extension-bubble-menu@2.0.0-beta.57) (2022-06-17)

### Reverts

- Revert "Publish" ([9c38d27](https://github.com/ueberdosis/tiptap/commit/9c38d2713e6feac5645ad9c1bfc57abdbf054576))

# [2.0.0-beta.56](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.55...@tiptap/extension-bubble-menu@2.0.0-beta.56) (2022-04-27)

### Bug Fixes

- Mark the bubble/floating menu extensions as side effect free ([172513c](https://github.com/ueberdosis/tiptap/commit/172513cb445fa295dd9f7d7ec553ed22baa9d435))

# [2.0.0-beta.55](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.54...@tiptap/extension-bubble-menu@2.0.0-beta.55) (2022-01-25)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.54](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.53...@tiptap/extension-bubble-menu@2.0.0-beta.54) (2022-01-04)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.53](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.52...@tiptap/extension-bubble-menu@2.0.0-beta.53) (2021-12-22)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.52](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.51...@tiptap/extension-bubble-menu@2.0.0-beta.52) (2021-12-15)

### Bug Fixes

- maybe hide tippy on blur, fix [#1433](https://github.com/ueberdosis/tiptap/issues/1433) ([063ced2](https://github.com/ueberdosis/tiptap/commit/063ced27ca55f331960b01ee6aea5623eee0ba49))

# [2.0.0-beta.51](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.50...@tiptap/extension-bubble-menu@2.0.0-beta.51) (2021-12-02)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.50](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.49...@tiptap/extension-bubble-menu@2.0.0-beta.50) (2021-11-17)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.49](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.48...@tiptap/extension-bubble-menu@2.0.0-beta.49) (2021-11-09)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.48](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.47...@tiptap/extension-bubble-menu@2.0.0-beta.48) (2021-11-09)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.47](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.46...@tiptap/extension-bubble-menu@2.0.0-beta.47) (2021-11-09)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.46](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.45...@tiptap/extension-bubble-menu@2.0.0-beta.46) (2021-11-08)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.45](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.44...@tiptap/extension-bubble-menu@2.0.0-beta.45) (2021-11-05)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.44](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.43...@tiptap/extension-bubble-menu@2.0.0-beta.44) (2021-10-31)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.43](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.42...@tiptap/extension-bubble-menu@2.0.0-beta.43) (2021-10-26)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.42](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.41...@tiptap/extension-bubble-menu@2.0.0-beta.42) (2021-10-14)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.41](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.40...@tiptap/extension-bubble-menu@2.0.0-beta.41) (2021-10-14)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.40](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.39...@tiptap/extension-bubble-menu@2.0.0-beta.40) (2021-10-08)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.39](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.38...@tiptap/extension-bubble-menu@2.0.0-beta.39) (2021-10-02)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.38](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.37...@tiptap/extension-bubble-menu@2.0.0-beta.38) (2021-09-29)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.37](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.36...@tiptap/extension-bubble-menu@2.0.0-beta.37) (2021-09-28)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.36](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.35...@tiptap/extension-bubble-menu@2.0.0-beta.36) (2021-09-27)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.35](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.34...@tiptap/extension-bubble-menu@2.0.0-beta.35) (2021-09-22)

### Bug Fixes

- Fix "destory" method in view plugins. ([#1882](https://github.com/ueberdosis/tiptap/issues/1882)) ([33420f4](https://github.com/ueberdosis/tiptap/commit/33420f4ae06d0d7eec16201a2e650be83cbb9de9))

# [2.0.0-beta.34](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.33...@tiptap/extension-bubble-menu@2.0.0-beta.34) (2021-09-15)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.33](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.32...@tiptap/extension-bubble-menu@2.0.0-beta.33) (2021-09-07)

### Bug Fixes

- don’t initialize tippy on requestAnimationFrame to avoid race conditions ([#1820](https://github.com/ueberdosis/tiptap/issues/1820)) ([ca3763d](https://github.com/ueberdosis/tiptap/commit/ca3763d3c29cc0715727fe12a0e907ad86d99806))

# [2.0.0-beta.32](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.31...@tiptap/extension-bubble-menu@2.0.0-beta.32) (2021-09-06)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.31](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.30...@tiptap/extension-bubble-menu@2.0.0-beta.31) (2021-08-23)

### Bug Fixes

- make shouldShow and pluginKey option for menus, fix [#1779](https://github.com/ueberdosis/tiptap/issues/1779) ([70a328b](https://github.com/ueberdosis/tiptap/commit/70a328bd3dea174170ad8e92db4c4f7f9368fd1b))

# [2.0.0-beta.30](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.29...@tiptap/extension-bubble-menu@2.0.0-beta.30) (2021-08-20)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.29](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.28...@tiptap/extension-bubble-menu@2.0.0-beta.29) (2021-08-13)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.28](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.27...@tiptap/extension-bubble-menu@2.0.0-beta.28) (2021-08-13)

### Bug Fixes

- rename key to pluginKey for menus ([89d26f7](https://github.com/ueberdosis/tiptap/commit/89d26f7cba2a115aa342f0ee621f0b65c840dfb8))

# [2.0.0-beta.27](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.26...@tiptap/extension-bubble-menu@2.0.0-beta.27) (2021-08-12)

### Bug Fixes

- fix some react focus issues ([#1724](https://github.com/ueberdosis/tiptap/issues/1724)), fix [#1716](https://github.com/ueberdosis/tiptap/issues/1716), fix [#1608](https://github.com/ueberdosis/tiptap/issues/1608), fix [#1520](https://github.com/ueberdosis/tiptap/issues/1520) ([956566e](https://github.com/ueberdosis/tiptap/commit/956566eaad0a522d6bc27d44594aa36d6c33f8b3))

# [2.0.0-beta.26](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.25...@tiptap/extension-bubble-menu@2.0.0-beta.26) (2021-08-11)

### Features

- add key option and shouldShow option to menus (fix [#1480](https://github.com/ueberdosis/tiptap/issues/1480), fix [#1043](https://github.com/ueberdosis/tiptap/issues/1043), fix [#1268](https://github.com/ueberdosis/tiptap/issues/1268), fix [#1503](https://github.com/ueberdosis/tiptap/issues/1503)) ([9ba61c1](https://github.com/ueberdosis/tiptap/commit/9ba61c1582cee838f2214d00285773ace2fb229e))

# [2.0.0-beta.25](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.24...@tiptap/extension-bubble-menu@2.0.0-beta.25) (2021-07-26)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.24](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.23...@tiptap/extension-bubble-menu@2.0.0-beta.24) (2021-06-23)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.23](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.22...@tiptap/extension-bubble-menu@2.0.0-beta.23) (2021-06-15)

### Bug Fixes

- fix a bug where bubble menu does not appear when selection starts from empty paragraph node, fix [#1474](https://github.com/ueberdosis/tiptap/issues/1474) ([f12b127](https://github.com/ueberdosis/tiptap/commit/f12b1273f24984806394e3deb431823a9d00ba79))

# [2.0.0-beta.22](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.21...@tiptap/extension-bubble-menu@2.0.0-beta.22) (2021-06-15)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.21](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.20...@tiptap/extension-bubble-menu@2.0.0-beta.21) (2021-06-14)

### Bug Fixes

- hide bubble menu on drag, fix [#1443](https://github.com/ueberdosis/tiptap/issues/1443) ([6034eb9](https://github.com/ueberdosis/tiptap/commit/6034eb9b30c3fe01ece9079c84c91ba9c6184518))
- show bubble menu for atom nodes even if there is no text content, fix [#1446](https://github.com/ueberdosis/tiptap/issues/1446) ([a3a7650](https://github.com/ueberdosis/tiptap/commit/a3a76507844cefc28111b9636c511ad9ef52ad28))

# [2.0.0-beta.20](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.19...@tiptap/extension-bubble-menu@2.0.0-beta.20) (2021-05-27)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.19](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.18...@tiptap/extension-bubble-menu@2.0.0-beta.19) (2021-05-24)

### Bug Fixes

- do not check for node selection within posToDOMRect ([c0e68d5](https://github.com/ueberdosis/tiptap/commit/c0e68d5a25608e0b6d9c127bbc507b4ba2a94a61))

# [2.0.0-beta.18](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.17...@tiptap/extension-bubble-menu@2.0.0-beta.18) (2021-05-18)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.17](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.16...@tiptap/extension-bubble-menu@2.0.0-beta.17) (2021-05-17)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.16](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.15...@tiptap/extension-bubble-menu@2.0.0-beta.16) (2021-05-13)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.15](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.14...@tiptap/extension-bubble-menu@2.0.0-beta.15) (2021-05-07)

### Bug Fixes

- revert adding exports ([bc320d0](https://github.com/ueberdosis/tiptap/commit/bc320d0b4b80b0e37a7e47a56e0f6daec6e65d98))

# [2.0.0-beta.14](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.13...@tiptap/extension-bubble-menu@2.0.0-beta.14) (2021-05-06)

### Bug Fixes

- revert adding type: module ([f8d6475](https://github.com/ueberdosis/tiptap/commit/f8d6475e2151faea6f96baecdd6bd75880d50d2c))

# [2.0.0-beta.13](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.12...@tiptap/extension-bubble-menu@2.0.0-beta.13) (2021-05-06)

### Bug Fixes

- add exports to package.json ([1277fa4](https://github.com/ueberdosis/tiptap/commit/1277fa47151e9c039508cdb219bdd0ffe647f4ee))

# [2.0.0-beta.12](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.11...@tiptap/extension-bubble-menu@2.0.0-beta.12) (2021-05-06)

### Bug Fixes

- add CellSelection support for bubble menu ([6472d2c](https://github.com/ueberdosis/tiptap/commit/6472d2c2715bd29a061abae6a59963949c298e55))

# [2.0.0-beta.11](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.10...@tiptap/extension-bubble-menu@2.0.0-beta.11) (2021-05-05)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.10](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.9...@tiptap/extension-bubble-menu@2.0.0-beta.10) (2021-05-04)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.9](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.8...@tiptap/extension-bubble-menu@2.0.0-beta.9) (2021-04-23)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.8](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.7...@tiptap/extension-bubble-menu@2.0.0-beta.8) (2021-04-22)

### Bug Fixes

- fix a bug for empty node selection where the bubble menu should not be visible, fix [#1023](https://github.com/ueberdosis/tiptap/issues/1023) ([8ed220a](https://github.com/ueberdosis/tiptap/commit/8ed220a12de48b3c14e903b271d7f50aff6313f4))

# [2.0.0-beta.7](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.6...@tiptap/extension-bubble-menu@2.0.0-beta.7) (2021-04-16)

### Bug Fixes

- fix tippy for react ([398fc7f](https://github.com/ueberdosis/tiptap/commit/398fc7f210b9d5449cbb00543ddf4af768552b9c))

### Features

- add coordsAtPos and posToClientRect helper methods ([8dab614](https://github.com/ueberdosis/tiptap/commit/8dab6144a661e4c90f33d9d2f300882009eadd46))
- add tippyOptions prop ([9a56f66](https://github.com/ueberdosis/tiptap/commit/9a56f666a118ca7c59a6f1f67f40e6490e20d3b8))
- remove keepInBounds ([d7282f1](https://github.com/ueberdosis/tiptap/commit/d7282f168bc6cfae4e1630d14bb8462bc135b254))

# [2.0.0-beta.6](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.5...@tiptap/extension-bubble-menu@2.0.0-beta.6) (2021-04-15)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.5](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.4...@tiptap/extension-bubble-menu@2.0.0-beta.5) (2021-04-01)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.4](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.3...@tiptap/extension-bubble-menu@2.0.0-beta.4) (2021-04-01)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.3](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.2...@tiptap/extension-bubble-menu@2.0.0-beta.3) (2021-03-31)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# [2.0.0-beta.2](https://github.com/ueberdosis/tiptap/compare/@tiptap/extension-bubble-menu@2.0.0-beta.1...@tiptap/extension-bubble-menu@2.0.0-beta.2) (2021-03-31)

**Note:** Version bump only for package @tiptap/extension-bubble-menu

# 2.0.0-beta.1 (2021-03-31)

**Note:** Version bump only for package @tiptap/extension-bubble-menu
