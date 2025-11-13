---
'@tiptap/core': minor
'@tiptap/extension-image': minor
---

1. **Added** an optional `createCustomHandle` callback to `ResizableNodeView`, allowing developers to fully customize resize handles. When provided, it replaces the default handle creation and bypasses the built-in `positionHandle` logic, giving complete control over markup, styling, and positioning while preserving backward compatibility.
2. **Removed** predefined inline styles from the `wrapper` element to better support dynamic alignment. This eliminates the need for `!important` overrides in user styles.
3. **Added** an editor `update` event listener to dynamically attach or remove resize handles based on the editor’s editable state. The implementation tracks the previous editable state to avoid unnecessary re-renders.
