---
"@tiptap/extension-bubble-menu": patch
---

Added a safeguard to avoid `TypeError: Cannot read properties of null (reading 'domFromPos')` being thrown when the editor was being destroyed
