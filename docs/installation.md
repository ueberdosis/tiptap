---
tableOfContents: true
---

# Installation

## Introduction
tiptap is framework-agnostic and even works with Vanilla JavaScript (if that’s your thing). The following integration guides help you integrating Tiptap in your JavaScript project.

## Integration guides
* [CDN](/installation/cdn)
* [React](/installation/react)
* [Next.js](/installation/nextjs)
* [Vue 3](/installation/vue3)
* [Vue 2](/installation/vue2)
* [Nuxt.js](/installation/nuxt)
* [Svelte](/installation/svelte)
* [Alpine.js](/installation/alpine)
* [Livewire](/installation/livewire) (Draft)

### Community efforts
* [Angular](https://github.com/sibiraj-s/ngx-tiptap)
* [SolidJS](https://github.com/LXSMNSYC/solid-tiptap)

## Vanilla JavaScript
You are using plain JavaScript or a framework that is not listed here? No worries, we provide everything you need.

### 1. Install the dependencies
For the following example you will need `@tiptap/core` (the actual editor) and `@tiptap/starter-kit`.

The StarterKit doesn’t include all, but the most common extensions.

```bash
npm install @tiptap/core @tiptap/starter-kit
```

### 2. Add some markup
Add the following HTML where you want the editor to be mounted:

```html
<div class="element"></div>
```

### 3. Initialize the editor
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
