---
"@tiptap/core": patch
---

Deduplicate named extensions during resolution using last-defined precedence. This removes the duplicate extension warning when the same extension is registered more than once (for example `StarterKit` together with `Dropcursor`) and prevents duplicate ProseMirror plugins from being registered.
