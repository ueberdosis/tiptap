---
'@tiptap/extension-drag-handle': patch
---

Respect margin properties passed via `dragImageProperties` on the drag preview. The clone reset its margin to `0` after copying styles, which discarded any margin the user explicitly requested. The reset now runs only when no margin property is listed in `dragImageProperties`, so the drag image can keep the same spacing as the live block.
