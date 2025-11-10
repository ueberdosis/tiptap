---
'@tiptap/extension-collaboration': patch
'@tiptap/extension-collaboration-caret': patch
'@tiptap/extension-drag-handle': patch
---

Fixed collaborative editing issues with certain emoji combinations by updating `@tiptap/y-tiptap` from beta to stable v3.0.0. Previously, specific emoji pairs (like 🔴🟢, 😎🐈, 🟣🔵) caused `URIError: URI malformed` errors that would break Y.js synchronization. This was due to improper handling of UTF-16 surrogate pairs in the underlying lib0 library. The stable release includes lib0 v0.2.100+ which correctly handles surrogate pairs, preventing them from being split during collaborative text operations.