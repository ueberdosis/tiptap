---
"@tiptap/extension-code-block": patch
"@tiptap/extension-code-block-lowlight": patch
---

`defaultLanguage` on Code Block Lowlight was not being respected properly, to address this we added `defaultLanguage` as an option to the code-block extension.
