---
"@tiptap/core": patch
"@tiptap/extension-list": patch
---

Fix toggleBulletList/toggleOrderedList not toggling off when selection includes trailing paragraph

When using Cmd+A to select all content, the selection includes the trailing empty paragraph. Previously, toggleBulletList() and toggleOrderedList() would wrap this trailing paragraph into the list instead of toggling the list off, creating new list items.

This fix detects when the selection includes a trailing empty paragraph after the list and adjusts the selection to exclude it before executing the lift command, allowing the list to be properly toggled off.
