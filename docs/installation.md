---
tableOfContents: true
---

# Installation

## Introduction
tiptap is framework-agnostic and even works with Vanilla JavaScript (if that’s your thing). The following integration guides help you integrating tiptap in your JavaScript project.

## Integration guides
* [CDN](/installation/cdn)
* [React](/installation/react)
* [Vue 3](/installation/vue3)
* [Vue 2](/installation/vue2)
* [Nuxt.js](/installation/nuxt)
* [Svelte](/installation/svelte)
* [Alpine.js](/installation/alpine)
* [Livewire](/installation/livewire) (Draft)
* [Angular](https://github.com/sibiraj-s/ngx-tiptap) (community package)

## Vanilla JavaScript
You’re using plain JavaScript or a framework that’s not listed here? No worries, we provide everything you need.

### Requirements
* [Node](https://nodejs.org/en/download/) installed on your machine

### 1. Install the dependencies
For the following example you will need `@tiptap/core` (the actual editor) and `@tiptap/starter-kit`.

The StarterKit doesn’t include all, but the most common extensions.

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

Open your project in the browser to see tiptap in action. Good work! Time to give yourself a pat on the back.
