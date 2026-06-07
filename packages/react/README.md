# @tiptap/react

[![Version](https://img.shields.io/npm/v/@tiptap/react.svg?label=version)](https://www.npmjs.com/package/@tiptap/react)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/react.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![License](https://img.shields.io/npm/l/@tiptap/react.svg)](https://www.npmjs.com/package/@tiptap/react)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

## Introduction

Tiptap is a headless wrapper around [ProseMirror](https://ProseMirror.net) – a toolkit for building rich text WYSIWYG editors, which is already in use at many well-known companies such as _New York Times_, _The Guardian_ or _Atlassian_.

## Official Documentation

Documentation can be found on the [Tiptap website](https://tiptap.dev).

## Common React setup note

When you call `useEditor({ immediatelyRender: false })`, the editor instance is
`null` on the first render. Gate the UI until the editor exists instead of
passing `null` into components that require a live editor instance.

```tsx
const editor = useEditor({
  extensions: [StarterKit],
  immediatelyRender: false,
})

if (!editor) {
  return <div>Loading editor…</div>
}

return <EditorContent editor={editor} />
```

## License

Tiptap is open sourced software licensed under the [MIT license](https://github.com/ueberdosis/tiptap/blob/main/LICENSE.md).
