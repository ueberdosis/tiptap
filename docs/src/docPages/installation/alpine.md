---
title: Alpine WYSIWYG
---

# Alpine.js

## toc

## Introduction
The following guide describes how to integrate tiptap with your [Alpine.js](https://github.com/alpinejs/alpine) project.

For the sake of this guide we’ll use [Vite](https://vitejs.dev/) to quickly set up a project, but you can use whatever you’re used to. Vite is just really fast and we love it.

## Requirements
* [Node](https://nodejs.org/en/download/) installed on your machine
* Experience with [Alpine.js](https://github.com/alpinejs/alpine)

## 1. Create a project (optional)
If you already have an existing Alpine.js project, that’s fine too. Just skip this step and proceed with the next step.

For the sake of this guide, let’s start with a fresh [Vite](https://vitejs.dev/) project called `tiptap-example`. Vite sets up everything we need, just select the Vanilla JavaScript template.

```bash
npm init @vitejs/app tiptap-example
cd tiptap-example
npm install
```

## 2. Install the dependencies
Okay, enough of the boring boilerplate work. Let’s finally install tiptap! For the following example you’ll need `alpinejs`, the `@tiptap/core` package and the `@tiptap/starter-kit` which has the most common extensions to get started quickly.

```bash
# install with npm
npm install alpinejs @tiptap/core @tiptap/starter-kit

# install with Yarn
yarn add alpinejs @tiptap/core @tiptap/starter-kit
```

If you followed step 1, you can now start your project with `npm run dev` or `yarn dev`, and open [http://localhost:3000](http://localhost:3000) in your favorite browser. This might be different, if you’re working with an existing project.

## 3. Initialize the editor
To actually start using tiptap, you’ll need to write a little bit of JavaScript. Let’s put the following example code in a file called `main.js`.

This is the fastest way to get tiptap up and running with Alpine.js. It will give you a very basic version of tiptap. No worries, you will be able to add more functionality soon.

```js
import alpinejs from 'alpinejs'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

window.setupEditor = function(content) {
  return {
    editor: null,
    content: content,
    updatedAt: Date.now(), // force Alpine to rerender on selection change
    init(element) {
      this.editor = new Editor({
        element: element,
        extensions: [
          StarterKit,
        ],
        content: this.content,
        onUpdate: ({ editor }) => {
          this.content = editor.getHTML()
        },
        onSelectionUpdate: () => {
          this.updatedAt = Date.now()
        },
      })
    },
  }
}
```

## 4. Add it to your app
Now, let’s replace the content of the `index.html` with the following example code to use the editor in our app.

```html
<!-- index.html -->
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

You should now see tiptap in your browser. Time to give yourself a pat on the back! :)
