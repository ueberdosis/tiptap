---
'@tiptap/vue-2': patch
---

Fix `TypeError: Cannot read properties of undefined (reading 'style')` thrown by `FloatingMenu` when the editor prop is provided synchronously. The component now registers the floating-menu plugin from `mounted()` (matching `BubbleMenu`) instead of an `immediate: true` watcher that fired before `$el` was available.
