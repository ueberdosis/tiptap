---
"@tiptap/suggestion": patch
---

Previously, `clientRect` was only obtained through `decorationNode`. If `decorationNode` could not be obtained, `clientRect` was set to `null`, which caused the suggestion not to render in some IME scenarios (notably Chinese IME).

This change adds a fallback method to compute `clientRect` from the editor's cursor position when `decorationNode` is not available. It generates a DOMRect based on the cursor coordinates so the suggestion can render even when the decoration node is missing.
