---
"@tiptap/core": patch
---

Improve TypeScript generics for Node.extend

The Node.extend method's TypeScript signature was updated so that ExtendedConfig can extend NodeConfig and MarkConfig,
improving type inference when extending Node and Mark classes with additional config properties.

This is a type-only change — there are no runtime behavior changes.
