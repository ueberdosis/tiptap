---
"@tiptap/extension-mention": patch
---

Use a named import for Suggestion from `@tiptap/suggestion` to avoid bundler ESM/CJS interop
wrapping (`__toESM`) that caused Jest/CJS consumers to receive a module object instead of the
callable plugin factory.

This is a non-breaking internal fix. It keeps runtime module shape stable for CommonJS (Jest)
and prevents the TypeError thrown when the extension attempted to call a non-function.
