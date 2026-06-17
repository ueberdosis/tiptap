---
'@tiptap/extensions': patch
---

Fix Placeholder flickering while a modal overlay is open. When the editor was occluded during a stream of transactions (e.g. remote collaboration edits), the viewport measurement fell back to a full-document range and repeatedly toggled the `data-placeholder` attribute on empty blocks. The viewport window is now frozen when the editor can't be measured reliably, so placeholders stay stable.
