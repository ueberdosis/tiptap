---
title: Vanilla JavaScript WYSIWYG
tableOfContents: true
---

# Vanilla JavaScript

**Note**<br />
If you don't use a bundler like Webpack or Rollup, please read the [CDN](/installation/cdn) guide instead. Since Tiptap is built in a modular way you will be required to use `<script type="module">` in your HTML to get our CDN imports working.

## Introduction
You are using plain JavaScript or a framework that is not listed here? No worries, we provide everything you need.

## 1. Install the dependencies
For the following example you will need `@tiptap/core` (the actual editor), `@tiptap/pm` (the ProseMirror library) and `@tiptap/starter-kit`. The StarterKit doesn’t include all, but the most common extensions.

```bash
npm install @tiptap/core @tiptap/pm @tiptap/starter-kit
```

## 2. Add some markup
Add the following HTML where you want the editor to be mounted:

```html
<div class="element"></div>
```

## 3. Initialize the editor
Everything is in place now, so let’s set up the actual editor now. Add the following code to your JavaScript:

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  element: document.querySelector('.element'),
  extensions: [
    StarterKit,
  ],
  content: '<p>Hello World!</p>',
})
```

Open your project in the browser to see Tiptap in action. Good work!
