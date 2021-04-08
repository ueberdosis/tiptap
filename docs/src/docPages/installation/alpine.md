---
title: Alpine WYSIWYG
---

# Alpine.js

## toc

## Introduction
The following guide describes how to integrate tiptap with your [Alpine.js](https://github.com/alpinejs/alpine) project.

TODO

## index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
</head>
<body>
  <div x-data="setupEditor('<p>Hello World! :-)</p>')" x-init="() => init($refs.element)">

    <template x-if="editor">
      <div class="menu">
        <button
          @click="editor.chain().toggleHeading({ level: 1 }).focus().run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        >
          H1
        </button>
        <button
          @click="editor.chain().toggleBold().focus().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
        >
          Bold
        </button>
        <button
          @click="editor.chain().toggleItalic().focus().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
        >
          Italic
        </button>
      </div>
    </template>

    <div x-ref="element"></div>
  </div>

  <script type="module" src="/main.js"></script>

  <style>
    body { margin: 2rem; font-family: sans-serif; }
    button.is-active { background: black; color: white; }
    .ProseMirror { padding: 0.5rem 1rem; margin: 1rem 0; border: 1px solid #ccc; }
  </style>
</body>
</html>
```

## main.js
```js
import alpinejs from 'https://cdn.skypack.dev/alpinejs'
import { Editor } from 'https://cdn.skypack.dev/@tiptap/core?min'
import { defaultExtensions } from 'https://cdn.skypack.dev/@tiptap/starter-kit?min'

window.setupEditor = function(content) {
  return {
    editor: null,
    content: content,
    init(element) {
      this.editor = new Editor({
        element: element,
        extensions: defaultExtensions(),
        content: this.content,
        onUpdate: ({ editor }) => {
          this.content = editor.getHTML()
        },
      })
    },
  }
}
```
