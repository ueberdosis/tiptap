---
"@tiptap/vue-2": patch
---

Fix BubbleMenu component compatibility with Vue 2 by addressing two runtime errors: updated options prop to use factory function for object default value, and added guard clause to prevent accessing $el before component mount.
