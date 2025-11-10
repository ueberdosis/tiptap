---
'@tiptap/core': patch
---

Fixed ProseMirror schema generation to properly respect `isRequired` attribute configuration. Previously, attributes marked with `isRequired: true` were incorrectly treated as optional because a `default` property was always included in the schema specification. ProseMirror determines attribute requirements by the absence of the `default` property, so now the `default` is only included when the attribute is not required and a default value is explicitly defined.
