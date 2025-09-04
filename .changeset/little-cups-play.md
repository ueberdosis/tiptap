---
'@tiptap/extension-code-block': patch
'@tiptap/extension-code-block-lowlight': patch
---

Added indentation support for code blocks via `Tab`. Is deactivated by default.

**New Extension Options**:
- `enableTabIndentation: boolean` - controls if tab completion should be enabled
- `tabSize: number` - controls how many spaces are inserted for a tab
