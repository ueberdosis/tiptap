---
title: Alpine WYSIWYG
---

# Alpine.js

## toc

## Introduction
The following guide describes how to integrate tiptap with your [Alpine.js](https://github.com/alpinejs/alpine) project.

TODO

## CodeSandbox
https://codesandbox.io/s/alpine-tiptap-2ro5e?file=/index.html:0-1419

## index.html
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Parcel Sandbox</title>
    <meta charset="UTF-8" />
    <link
      href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css"
      rel="stylesheet"
    />
    <script
      src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.8.0/dist/alpine.min.js"
      defer
    ></script>
  </head>

  <body>
    <div
      x-data="setupEditor('<p>My content goes here</p>')"
      x-init="() => init($refs.editor)"
      x-on:click.away="inFocus = false"
    >
      <template x-if="editor">
        <nav class="space-x-1">
          <button
            class="bg-gray-200 rounded px-2 py-1"
            x-bind:class="{ 'bg-gray-600 text-white': editor.isActive('bold') }"
            @click="editor.chain().focus().toggleBold().run()"
          >
            Bold
          </button>
          <button
            class="bg-gray-200 rounded px-2 py-1"
            x-bind:class="{ 'bg-gray-600 text-white': editor.isActive('italic') }"
            @click="editor.chain().focus().toggleItalic().run()"
          >
            Italic
          </button>
        </nav>
      </template>
      <div x-ref="editor"></div>
      <button
        class="bg-indigo-500 text-white rounded px-3 py-1"
        x-on:click="console.log(content)"
      >
        Submit
      </button>
      (view console for editor output)
    </div>

    <script src="src/index.js"></script>
  </body>
</html>
```

## index.js
```js
import { Editor as TipTap } from "@tiptap/core"
import { defaultExtensions } from "@tiptap/starter-kit"

window.setupEditor = function (content) {
  return {
    content: content,
    inFocus: false,
    // updatedAt is to force Alpine to
    // rerender on selection change
    updatedAt: Date.now(),
    editor: null,

    init(el) {
      let editor = new TipTap({
        element: el,
        extensions: defaultExtensions(),
        content: this.content,
        editorProps: {
          attributes: {
            class: "prose-sm py-4 focus:outline-none"
          }
        }
      })

      editor.on("update", () => {
        this.content = this.editor.getHTML()
      })

      editor.on("focus", () => {
        this.inFocus = true
      })

      editor.on("selection", () => {
        this.updatedAt = Date.now()
      })

      this.editor = editor
    }
  }
}
```
