---
'@tiptap/vue': patch
---

Fix `useId()` returning the same id for every Vue node view. Node views are mounted standalone via Vue's low-level `render()` API and have no real parent component instance, so `useId()`'s per-instance counter (`instance.ids`, inherited from `parent.ids`) always restarted at `0` for every node view — any two node views calling `useId()` produced identical ids. Each `VueRenderer` now gets its own `appContext.config.idPrefix`, keeping ids unique across node views.
