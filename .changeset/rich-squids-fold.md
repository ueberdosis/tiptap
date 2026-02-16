---
'@tiptap/extension-code-block-lowlight': patch
---

Fixed a runtime error when initializing `CodeBlockLowlight` by switching the `CodeBlock` import to a named export. This prevents `extend is not a function` errors caused by ESM/CJS interop issues.
