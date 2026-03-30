---
'@tiptap/extension-table': minor
---

Added Markdown table alignment support. The `TableCell` and `TableHeader` nodes now have an `align` attribute (`left`, `center`, `right`) that is parsed from Markdown column alignment markers (`:---`, `---:`, `:---:`) and serialized back when rendering to Markdown. Alignment is also parsed from and rendered to HTML via `style="text-align: ..."`.
