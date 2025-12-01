---
'@tiptap/extension-collaboration': minor
'@tiptap/core': minor
---

Implement position mapping using the `MappablePosition` class. This enables position mapping in collaborative editing scenarios.

- Introduce `MappablePosition` class in core with `position`, `fromJson`, and `toJSON` methods
- Add `editor.utils` property with `getUpdatedPosition(position, transaction)` and `createMappablePosition()` methods
- Create `CollaborationMappablePosition` subclass that extends `MappablePosition` with Y.js relative position support