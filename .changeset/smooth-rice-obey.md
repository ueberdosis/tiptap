---
"@tiptap/react": patch
---

Optimize `useEditor` and `useEditorState` to reduce number of instances created while still being performant #5432

The core of this change is two-fold:
 - have the effect run on every render (i.e. without a dep array)
 - schedule destruction of instances, but bail on the actual destruction if the instance was still mounted and a new instance had not been created yet

It should plug a memory leak, where editor instances could be created but not cleaned up in strict mode.
As well as fixing a bug where a re-render, with deps, was not applying new options that were set on `useEditor`.
