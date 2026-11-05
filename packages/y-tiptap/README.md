# @tiptap/y-tiptap

[![Version](https://img.shields.io/npm/v/@tiptap/y-tiptap.svg?label=version)](https://www.npmjs.com/package/@tiptap/y-tiptap)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/y-tiptap.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![License](https://img.shields.io/npm/l/@tiptap/y-tiptap.svg)](https://www.npmjs.com/package/@tiptap/y-tiptap)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

## Introduction

Tiptap is a headless rich text editor toolkit built on [ProseMirror](https://prosemirror.net).

## What is this `y-tiptap` package?

The `y-tiptap` package connects Yjs documents to ProseMirror editors. It provides document synchronization, shared cursors, undo and redo, relative positions, and document conversion utilities.

## Relative positions

Use `absolutePositionToRelativePosition` and `relativePositionToAbsolutePosition` to store and resolve positions. The binding tracks text characters, XML nodes, and empty paragraph boundaries through structural changes and moves that retain the ProseMirror node identity. Copies keep separate identities. Conflicting concurrent destinations and deleted identities resolve to `null`.

These transfers are shared in a separate Y.Map in the same document. Persist the complete Y.Doc as a binary update to retain them. Use the exported `undo` and `redo` functions to share restored identities. A custom UndoManager must track editor content and exclude the transfer map.

Native Yjs resolvers and direct XML changes do not use these transfers. Moves reconstructed from new ProseMirror nodes cannot be inferred from equal content. Root document boundaries remain attached to the document.

## Content that does not fit the schema

By default, the sync plugin deletes shared content that the editor schema cannot show, and fills in missing required nodes. These repairs are written to the shared document.

Set `onInvalidContent` to keep that content instead:

```ts
ySyncPlugin(fragment, {
  onInvalidContent: error => console.warn(error),
})
```

While shared content does not fit the schema, the editor shows what it can, editing and undo pause, and no changes are written to the shared document. The callback runs each time shared content stops fitting the schema. Read the current error from `ySyncPluginKey.getState(state)?.binding.invalidContentError`. Editing resumes when a remote update brings compatible content.

The Tiptap Collaboration extension sets this option when the editor has `enableContentCheck: true` and emits a `contentError` event.

## Official Documentation

Documentation can be found on the [Tiptap website](https://tiptap.dev).

## License

Tiptap is open source software licensed under the [MIT license](./LICENSE).
