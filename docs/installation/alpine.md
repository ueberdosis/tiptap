---
title: Alpine WYSIWYG
tableOfContents: true
---

# Alpine.js

## Introduction
The following guide describes how to integrate Tiptap with version 3 of [Alpine.js](https://github.com/alpinejs/alpine).

For the sake of this guide we’ll use [Vite](https://vitejs.dev/) to quickly set up a project, but you can use whatever you’re used to. Vite is just really fast and we love it.

## Requirements
* [Node](https://nodejs.org/en/download/) installed on your machine
* Experience with [Alpine.js](https://github.com/alpinejs/alpine)

## 1. Create a project (optional)
If you already have an existing Alpine.js project, that’s fine too. Just skip this step and proceed with the next step.

For the sake of this guide, let’s start with a fresh [Vite](https://vitejs.dev/) project called `my-tiptap-project`. Vite sets up everything we need, just select the Vanilla JavaScript template.

```bash
npm init vite@latest my-tiptap-project -- --template vanilla
cd my-tiptap-project
npm install
npm run dev
```

## 2. Install the dependencies

Okay, enough of the boring boilerplate work. Let’s finally install Tiptap! For the following example you’ll need `alpinejs`, the `@tiptap/core` package and the `@tiptap/starter-kit` which has the most common extensions to get started quickly.

```bash
npm install alpinejs @tiptap/core @tiptap/starter-kit
```

If you followed step 1, you can now start your project with `npm run dev`, and open [http://localhost:5173](http://localhost:5173) in your favorite browser. This might be different, if you’re working with an existing project.

## 3. Initialize the editor
To actually start using Tiptap, you’ll need to write a little bit of JavaScript. Let’s put the following example code in a file called `main.js`.

This is the fastest way to get Tiptap up and running with Alpine.js. It will give you a very basic version of Tiptap. No worries, you will be able to add more functionality soon.

```js
import Alpine from 'alpinejs'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

document.addEventListener('alpine:init', () => {
  Alpine.data('editor', (content) => {
    let editor

    return {
      updatedAt: Date.now(), // force Alpine to rerender on selection change
      init() {
        const _this = this

        editor = new Editor({
          element: this.$refs.element,
          extensions: [
            StarterKit
          ],
          content: content,
          onCreate({ editor }) {
            _this.updatedAt = Date.now()
          },
          onUpdate({ editor }) {
            _this.updatedAt = Date.now()
          },
          onSelectionUpdate({ editor }) {
            _this.updatedAt = Date.now()
          }
        });
      },
      isLoaded() {
        return editor
      },
      isActive(type, opts = {}) {
        return editor.isActive(type, opts)
      },
      toggleHeading(opts) {
        editor.chain().toggleHeading(opts).focus().run()
      },
      toggleBold() {
        editor.chain().toggleBold().focus().run()
      },
      toggleItalic() {
        editor.chain().toggleItalic().focus().run()
      },
    };
  });
});

window.Alpine = Alpine
Alpine.start()
```

## 4. Add it to your app
Now, let’s replace the content of the `index.html` with the following example code to use the editor in our app.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
</head>
<body>
  <div x-data="editor('<p>Hello world! :-)</p>')">

    <template x-if="isLoaded()">
      <div class="menu">
        <button
          @click="toggleHeading({ level: 1 })"
          :class="{ 'is-active': isActive('heading', { level: 1 }, updatedAt) }"
        >
          H1
        </button>
        <button
          @click="toggleBold()"
          :class="{ 'is-active' : isActive('bold', updatedAt) }"
        >
          Bold
        </button>
        <button
          @click="toggleItalic()"
          :class="{ 'is-active' : isActive('italic', updatedAt) }"
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

You should now see Tiptap in your browser. Time to give yourself a pat on the back! :)
