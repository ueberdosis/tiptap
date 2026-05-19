# @tiptap/static-renderer

[![Version](https://img.shields.io/npm/v/@tiptap/static-renderer.svg?label=version)](https://www.npmjs.com/package/@tiptap/static-renderer)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/static-renderer.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![License](https://img.shields.io/npm/l/@tiptap/static-renderer.svg)](https://www.npmjs.com/package/@tiptap/static-renderer)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

## Introduction

Tiptap is a headless wrapper around [ProseMirror](https://ProseMirror.net) – a toolkit for building rich text WYSIWYG editors, which is already in use at many well-known companies such as _New York Times_, _The Guardian_ or _Atlassian_.

## Official Documentation

Documentation can be found on the [Tiptap website](https://tiptap.dev).

## Limitations & workarounds

The static renderer builds the ProseMirror schema and runs each extension's
`renderHTML`, but it does **not** instantiate an `Editor`. As a result:

- `addProseMirrorPlugins`, `onCreate`, `onUpdate`, and transaction hooks do
  not run.
- Extensions that assign attributes via those mechanisms — such as
  `UniqueID` (`data-id`) and `TableOfContents` (`id`, `data-toc-id`) — will
  not populate those attributes on their own.

For these cases, pre-process the JSON document before rendering:

```ts
import { generateUniqueIds } from '@tiptap/extension-unique-id'
import { generateTocIds } from '@tiptap/extension-table-of-contents'
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string'

let doc = sourceJson
doc = generateUniqueIds(doc, extensions) // if using UniqueID
doc = generateTocIds(doc, extensions)    // if using TableOfContents

const html = renderToHTMLString({
  content: doc,
  extensions,
  textDirection: 'auto', // mirrors the editor option
})
```

Editor-level options that affect output are accepted as top-level arguments
(currently `textDirection`). Other editor options that depend on a runtime
view or transaction stream are out of scope.

## License

Tiptap is open sourced software licensed under the [MIT license](https://github.com/ueberdosis/tiptap/blob/main/LICENSE.md).
