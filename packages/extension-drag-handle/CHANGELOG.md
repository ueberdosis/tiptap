# @tiptap/extension-drag-handle

## 3.4.4

### Patch Changes

- Updated dependencies [00cf1d7]
  - @tiptap/core@3.4.4
  - @tiptap/extension-collaboration@3.4.4
  - @tiptap/extension-node-range@3.4.4
  - @tiptap/pm@3.4.4

## 3.4.3

### Patch Changes

- Updated dependencies [1ea8906]
  - @tiptap/core@3.4.3
  - @tiptap/extension-collaboration@3.4.3
  - @tiptap/extension-node-range@3.4.3
  - @tiptap/pm@3.4.3

## 3.4.2

### Patch Changes

- @tiptap/core@3.4.2
- @tiptap/extension-collaboration@3.4.2
- @tiptap/extension-node-range@3.4.2
- @tiptap/pm@3.4.2

## 3.4.1

### Patch Changes

- @tiptap/core@3.4.1
- @tiptap/extension-collaboration@3.4.1
- @tiptap/extension-node-range@3.4.1
- @tiptap/pm@3.4.1

## 3.4.0

### Patch Changes

- Updated dependencies [895c73f]
- Updated dependencies [ad51daa]
  - @tiptap/core@3.4.0
  - @tiptap/extension-collaboration@3.4.0
  - @tiptap/extension-node-range@3.4.0
  - @tiptap/pm@3.4.0

## 3.3.1

### Patch Changes

- 8eff69a: Improve drag handle node lookup by scanning element bounding rects inside the editor instead of performing per-pixel `elementsFromPoint` loops, and throttle mouse handling to a single update per animation frame to reduce CPU usage and improve stability.

  This should make drag handle positioning and node detection significantly faster and more robust.

- Updated dependencies [02eae08]
  - @tiptap/extension-collaboration@3.3.1
  - @tiptap/core@3.3.1
  - @tiptap/extension-node-range@3.3.1
  - @tiptap/pm@3.3.1

## 3.3.0

### Patch Changes

- Updated dependencies [5423726]
- Updated dependencies [5423726]
  - @tiptap/core@3.3.0
  - @tiptap/extension-collaboration@3.3.0
  - @tiptap/extension-node-range@3.3.0
  - @tiptap/pm@3.3.0

## 3.2.2

### Patch Changes

- @tiptap/core@3.2.2
- @tiptap/extension-collaboration@3.2.2
- @tiptap/extension-node-range@3.2.2
- @tiptap/pm@3.2.2

## 3.2.1

### Patch Changes

- Updated dependencies [6a2873f]
  - @tiptap/core@3.2.1
  - @tiptap/extension-collaboration@3.2.1
  - @tiptap/extension-node-range@3.2.1
  - @tiptap/pm@3.2.1

## 3.2.0

### Patch Changes

- Updated dependencies [5056e3e]
  - @tiptap/core@3.2.0
  - @tiptap/extension-collaboration@3.2.0
  - @tiptap/extension-node-range@3.2.0
  - @tiptap/pm@3.2.0

## 3.1.0

### Minor Changes

- 978c548: Expose `onDragStart` and `onDragEnd` callbacks to improve custom drag behavior. This allows better UI control compared to relying on `editor.view.dragging`, especially when using absolute-positioned drag handles.

### Patch Changes

- @tiptap/core@3.1.0
- @tiptap/extension-collaboration@3.1.0
- @tiptap/extension-node-range@3.1.0
- @tiptap/pm@3.1.0

## 3.0.9

### Patch Changes

- @tiptap/core@3.0.9
- @tiptap/extension-collaboration@3.0.9
- @tiptap/extension-node-range@3.0.9
- @tiptap/pm@3.0.9

## 3.0.8

### Patch Changes

- @tiptap/core@3.0.8
- @tiptap/extension-collaboration@3.0.8
- @tiptap/extension-node-range@3.0.8
- @tiptap/pm@3.0.8

## 3.0.7

### Patch Changes

- @tiptap/core@3.0.7
- @tiptap/extension-collaboration@3.0.7
- @tiptap/extension-node-range@3.0.7
- @tiptap/pm@3.0.7

## 3.0.6

### Patch Changes

- Updated dependencies [2e71d05]
  - @tiptap/core@3.0.6
  - @tiptap/extension-collaboration@3.0.6
  - @tiptap/extension-node-range@3.0.6
  - @tiptap/pm@3.0.6

## 3.0.5

### Patch Changes

- @tiptap/core@3.0.5
- @tiptap/extension-collaboration@3.0.5
- @tiptap/extension-node-range@3.0.5
- @tiptap/pm@3.0.5

## 3.0.4

### Patch Changes

- Updated dependencies [7ed03fa]
  - @tiptap/core@3.0.4
  - @tiptap/extension-collaboration@3.0.4
  - @tiptap/extension-node-range@3.0.4
  - @tiptap/pm@3.0.4

## 3.0.3

### Patch Changes

- Updated dependencies [75cabde]
  - @tiptap/core@3.0.3
  - @tiptap/extension-collaboration@3.0.3
  - @tiptap/extension-node-range@3.0.3
  - @tiptap/pm@3.0.3

## 3.0.2

### Patch Changes

- @tiptap/core@3.0.2
- @tiptap/extension-collaboration@3.0.2
- @tiptap/extension-node-range@3.0.2
- @tiptap/pm@3.0.2

## 3.0.1

### Minor Changes

- 952623f: Added logic to hide drag handle during typing to reduce visual clutter
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

- 6137cdc: Fix a bug where new keydown event handling would prevent other events
- Updated dependencies [1b4c82b]
- Updated dependencies [1e91f9b]
- Updated dependencies [a92f4a6]
- Updated dependencies [8de8e13]
- Updated dependencies [20f68f6]
- Updated dependencies [5e957e5]
- Updated dependencies [89bd9c7]
- Updated dependencies [a33d20c]
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
- Updated dependencies [f43b2e5]
- Updated dependencies [664834f]
- Updated dependencies [ac897e7]
- Updated dependencies [087d114]
- Updated dependencies [32958d6]
- Updated dependencies [fc17b21]
- Updated dependencies [62b0877]
- Updated dependencies [e20006b]
- Updated dependencies [5ba480b]
- Updated dependencies [d6c7558]
- Updated dependencies [7ac01ef]
- Updated dependencies [062afaf]
- Updated dependencies [9ceeab4]
- Updated dependencies [32958d6]
- Updated dependencies [bf835b0]
- Updated dependencies [4e2f6d8]
- Updated dependencies [32958d6]
  - @tiptap/extension-collaboration@3.0.1
  - @tiptap/core@3.0.1
  - @tiptap/pm@3.0.1
  - @tiptap/extension-node-range@3.0.1

## 3.0.0-beta.30

### Patch Changes

- 6137cdc: Fix a bug where new keydown event handling would prevent other events
  - @tiptap/core@3.0.0-beta.30
  - @tiptap/extension-collaboration@3.0.0-beta.30
  - @tiptap/extension-node-range@3.0.0-beta.30
  - @tiptap/pm@3.0.0-beta.30

## 3.0.0-beta.29

### Minor Changes

- 952623f: Added logic to hide drag handle during typing to reduce visual clutter

### Patch Changes

- @tiptap/core@3.0.0-beta.29
- @tiptap/extension-collaboration@3.0.0-beta.29
- @tiptap/extension-node-range@3.0.0-beta.29
- @tiptap/pm@3.0.0-beta.29

## 3.0.0-beta.28

### Patch Changes

- @tiptap/core@3.0.0-beta.28
- @tiptap/extension-collaboration@3.0.0-beta.28
- @tiptap/extension-node-range@3.0.0-beta.28
- @tiptap/pm@3.0.0-beta.28

## 3.0.0-beta.27

### Patch Changes

- Updated dependencies [412e1bd]
  - @tiptap/core@3.0.0-beta.27
  - @tiptap/extension-collaboration@3.0.0-beta.27
  - @tiptap/extension-node-range@3.0.0-beta.27
  - @tiptap/pm@3.0.0-beta.27

## 3.0.0-beta.26

### Patch Changes

- Updated dependencies [5ba480b]
  - @tiptap/core@3.0.0-beta.26
  - @tiptap/extension-collaboration@3.0.0-beta.26
  - @tiptap/extension-node-range@3.0.0-beta.26
  - @tiptap/pm@3.0.0-beta.26

## 3.0.0-beta.25

### Patch Changes

- Updated dependencies [4e2f6d8]
  - @tiptap/core@3.0.0-beta.25
  - @tiptap/extension-collaboration@3.0.0-beta.25
  - @tiptap/extension-node-range@3.0.0-beta.25
  - @tiptap/pm@3.0.0-beta.25

## 3.0.0-beta.24

### Patch Changes

- @tiptap/core@3.0.0-beta.24
- @tiptap/extension-collaboration@3.0.0-beta.24
- @tiptap/extension-node-range@3.0.0-beta.24
- @tiptap/pm@3.0.0-beta.24

## 3.0.0-beta.23

### Patch Changes

- @tiptap/core@3.0.0-beta.23
- @tiptap/extension-collaboration@3.0.0-beta.23
- @tiptap/extension-node-range@3.0.0-beta.23
- @tiptap/pm@3.0.0-beta.23

## 3.0.0-beta.22

### Patch Changes

- @tiptap/core@3.0.0-beta.22
- @tiptap/extension-collaboration@3.0.0-beta.22
- @tiptap/extension-node-range@3.0.0-beta.22
- @tiptap/pm@3.0.0-beta.22

## 3.0.0-beta.21

### Patch Changes

- Updated dependencies [813674c]
- Updated dependencies [fc17b21]
  - @tiptap/core@3.0.0-beta.21
  - @tiptap/extension-collaboration@3.0.0-beta.21
  - @tiptap/extension-node-range@3.0.0-beta.21
  - @tiptap/pm@3.0.0-beta.21

## 3.0.0-beta.20

### Patch Changes

- @tiptap/core@3.0.0-beta.20
- @tiptap/extension-collaboration@3.0.0-beta.20
- @tiptap/extension-node-range@3.0.0-beta.20
- @tiptap/pm@3.0.0-beta.20

## 3.0.0-beta.19

### Patch Changes

- Updated dependencies [9ceeab4]
  - @tiptap/core@3.0.0-beta.19
  - @tiptap/extension-collaboration@3.0.0-beta.19
  - @tiptap/extension-node-range@3.0.0-beta.19
  - @tiptap/pm@3.0.0-beta.19

## 3.0.0-beta.18

### Patch Changes

- @tiptap/core@3.0.0-beta.18
- @tiptap/extension-collaboration@3.0.0-beta.18
- @tiptap/extension-node-range@3.0.0-beta.18
- @tiptap/pm@3.0.0-beta.18

## 3.0.0-beta.17

### Patch Changes

- Updated dependencies [e20006b]
  - @tiptap/core@3.0.0-beta.17
  - @tiptap/extension-collaboration@3.0.0-beta.17
  - @tiptap/extension-node-range@3.0.0-beta.17
  - @tiptap/pm@3.0.0-beta.17

## 3.0.0-beta.16

### Patch Changes

- Updated dependencies [ac897e7]
- Updated dependencies [bf835b0]
  - @tiptap/core@3.0.0-beta.16
  - @tiptap/extension-collaboration@3.0.0-beta.16
  - @tiptap/extension-node-range@3.0.0-beta.16
  - @tiptap/pm@3.0.0-beta.16

## 3.0.0-beta.15

### Patch Changes

- Updated dependencies [087d114]
  - @tiptap/core@3.0.0-beta.15
  - @tiptap/extension-collaboration@3.0.0-beta.15
  - @tiptap/extension-node-range@3.0.0-beta.15
  - @tiptap/pm@3.0.0-beta.15

## 3.0.0-beta.14

### Patch Changes

- Updated dependencies [95b8c71]
  - @tiptap/core@3.0.0-beta.14
  - @tiptap/extension-collaboration@3.0.0-beta.14
  - @tiptap/extension-node-range@3.0.0-beta.14
  - @tiptap/pm@3.0.0-beta.14

## 3.0.0-beta.13

### Patch Changes

- @tiptap/core@3.0.0-beta.13
- @tiptap/extension-collaboration@3.0.0-beta.13
- @tiptap/extension-node-range@3.0.0-beta.13
- @tiptap/pm@3.0.0-beta.13

## 3.0.0-beta.12

### Patch Changes

- @tiptap/core@3.0.0-beta.12
- @tiptap/extension-collaboration@3.0.0-beta.12
- @tiptap/extension-node-range@3.0.0-beta.12
- @tiptap/pm@3.0.0-beta.12

## 3.0.0-beta.11

### Patch Changes

- @tiptap/core@3.0.0-beta.11
- @tiptap/extension-collaboration@3.0.0-beta.11
- @tiptap/extension-node-range@3.0.0-beta.11
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

- Updated dependencies [7ac01ef]
  - @tiptap/extension-node-range@3.0.0-beta.10
  - @tiptap/core@3.0.0-beta.10
  - @tiptap/extension-collaboration@3.0.0-beta.10
  - @tiptap/pm@3.0.0-beta.10
