---
'@tiptap/static-renderer': patch
---

Fix the types of `renderJSONContentToReactElement` and `renderJSONContentToString`. They defaulted their node and mark generics to the ProseMirror-oriented `NodeType`/`MarkType`, so `node.text` did not exist in a node mapping, every node prop was typed `any`, and passing a value typed as `JSONContent` failed (`type` is optional in `JSONContent` but was required). They now default to the newly exported `JSONNodeType`/`JSONMarkType`, so `node.text` is typed `string | undefined` and a `JSONContent` document is accepted directly. The ProseMirror `pm/*` renderers are unaffected, since they parameterize explicitly with `Mark`/`Node`.
