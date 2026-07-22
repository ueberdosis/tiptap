---
"@tiptap/vue-3": patch
---

Fix `<node-view-content as="tbody">` (and similar restricted-content elements) rendering with an extra wrapper `<div>` nested inside them, which broke tables in Vue node views. Note: keep `<node-view-content>` mounted (use `v-show`, not `v-if`) — conditionally remounting it can leave ProseMirror attached to the old element.
