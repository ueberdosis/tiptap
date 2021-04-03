# Installation

## toc

## Introduction
tiptap 2 is framework-agnostic and even works with plain JavaScript, if that’s your thing. We’re working on guides for all the different frameworks and workflows. The following steps should help you to integrate tiptap in your JavaScript project.

## Integration guides
* [CDN](/installation/cdn)
* [CodeSandbox](/installation/codesandbox)
* [Vue 2](/installation/vue2)
* [Vue 3](/installation/vue3)
* [Nuxt.js](/installation/nuxt)
* [React](/installation/react) (Draft)
* [Svelte](/installation/svelte) (Draft)
* [Alpine.js](/installation/alpine) (Draft)
* [Livewire](/installation/livewire) (Draft)

## Vanilla JavaScript

### Requirements
* [Node](https://nodejs.org/en/download/) installed on your machine

### 1. Install the dependencies
For the following example you will need `@tiptap/core` (the actual editor) and `@tiptap/starter-kit` which has everything to get started quickly, for example the most common extensions.

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
Now, let’s initialize the editor in JavaScript:

```js
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  element: document.querySelector('.element'),
  extensions: defaultExtensions(),
  content: '<p>Hello World!</p>',
})
```

Open your project in the browser and you should see tiptap. Good work! Time to give yourself a pat on the back.
