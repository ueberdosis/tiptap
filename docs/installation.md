---
tableOfContents: true
---

# Installation

## Introduction
Tiptap is framework-agnostic and even works with Vanilla JavaScript (if that’s your thing). The following integration guides help you integrating Tiptap in your JavaScript project.

## Integration guides
<!-- * [CDN](/installation/cdn) -->
* [React](/installation/react)
* [Next.js](/installation/nextjs)
* [Vue 3](/installation/vue3)
* [Vue 2](/installation/vue2)
* [Nuxt.js](/installation/nuxt)
* [Svelte](/installation/svelte)
* [Alpine.js](/installation/alpine)
* [PHP](/installation/php)

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

**Important note for 2.0.0-beta.205 and higher**

Since Tiptap is based on Prosemirror, you will need to install the Prosemirror dependencies if you don't have them installed already to avoid version clashes.

**Note**: If you use NPM 7 or higher, peerDependencies are automatically installed.

```bash
# Installation with NPM 6 or lower
npm install prosemirror-commands prosemirror-keymap prosemirror-model prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view

# Installation with yarn
yarn add prosemirror-commands prosemirror-keymap prosemirror-model prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view

# Installation with pnpm
pnpm install prosemirror-commands prosemirror-keymap prosemirror-model prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view
````

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
