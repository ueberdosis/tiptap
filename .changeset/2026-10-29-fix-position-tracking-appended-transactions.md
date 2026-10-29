---
'@tiptap/y-tiptap': patch
---

Skip the position migration for a transaction when the editor content and the Yjs fragment have diverged within the same dispatch, instead of throwing `Position tracking requires synchronized editor text`. An appended transaction (for example an anchor id assigned by the table of contents when a heading receives its first character) could previously kill the whole dispatch, so every keystroke into a heading created in a collaborative session was swallowed. Such transactions now fall back to the default prosemirror position mapping.
