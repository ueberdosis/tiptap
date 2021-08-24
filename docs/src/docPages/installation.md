---
tableOfContents: true
---

# Installation

## toc

## Introduction
tiptap is framework-agnostic and even works with Vanilla JavaScript, if that’s your thing. The following integration guides should help you to integrate tiptap in your JavaScript project.

## Integration guides
* [CDN](/installation/cdn)
<!-- * [CodeSandbox](/installation/codesandbox) -->
* [React](/installation/react)
* [Vue 3](/installation/vue3)
* [Vue 2](/installation/vue2)
* [Nuxt.js](/installation/nuxt)
* [Svelte](/installation/svelte)
* [Alpine.js](/installation/alpine)
* [Livewire](/installation/livewire) (Draft)
* [Angular](https://github.com/sibiraj-s/ngx-tiptap) (community package)

## Vanilla JavaScript

### Requirements
* [Node](https://nodejs.org/en/download/) installed on your machine

### 1. Install the dependencies
For the following example you will need `@tiptap/core` (the actual editor) and `@tiptap/starter-kit` which has the most common extensions to get started quickly.

```bash
# install with npm
npm install @tiptap/core @tiptap/starter-kit

# install with Yarn
yarn add @tiptap/core @tiptap/starter-kit
```

### 2. Add some markup
Add the following HTML where you want the editor to be mounted:

```html
<div class="element"></div>
```

### 3. Initialize the editor
Let’s initialize the editor in JavaScript now:

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

Open your project in the browser to see tiptap in action. Good work! Time to give yourself a pat on the back.
