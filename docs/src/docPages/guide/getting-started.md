# Getting started

## toc

## Introduction
tiptap 2 is framework-agnostic and even works with plain JavaScript, if that’s your thing. We’re working on guides for all the different frameworks and workflows, but here is the general one. The following steps should help you to integrate tiptap in your JavaScript project.

## Alternative Guides
* [Vue CLI](/guide/getting-started/vue-cli)
* [Nuxt.js](/guide/getting-started/nuxtjs)
* [React](/guide/getting-started/react) (Draft)
* [Svelte](/guide/getting-started/svelte) (Draft)
* [Alpine.js](/guide/getting-started/alpinejs) (Draft)
* [Livewire](/guide/getting-started/livewire) (Draft)

## Requirements
* [Node](https://nodejs.org/en/download/) installed on your machine

## 1. Install the dependencies
For the following example you’ll need the `@tiptap/core` (the actual editor) and the `@tiptap/starter-kit` which has everything to get started quickly, for example a few default extensions.

```bash
# install with npm
npm install @tiptap/core @tiptap/starter-kit

# install with Yarn
yarn add @tiptap/core @tiptap/starter-kit
```

## 2. Add a container
You need a place somewhere in your app, where we should place tiptap. Place the following HTML there:

```html
<div class="element"></div>
```

## 3. Initialize the editor
Now, let’s initialize the editor in JavaScript:

```js
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  element: document.querySelector('.element'),
  extensions: defaultExtensions(),
  content: '<p>Your content.</p>',
})
```

When you open the project in your browser, you should now see tiptap in action. Time to give yourself a pat on the back. Let’s start to configure your editor in the next step.
