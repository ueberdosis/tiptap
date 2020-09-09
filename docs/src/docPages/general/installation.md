# Installation

tiptap has a very modular package structure and is independent of any framework. Depending on what you want to do with tiptap there are a few different ways to install tiptap in your project. Choose the way that fits your project best.

## Plain JavaScript

Use tiptap with vanilla JavaScript for a very lightweight and raw experience. If you feel like it, you can even use it to connect the tiptap core with other frameworks not mentioned here.

```bash
# With npm
npm install @tiptap/core @tiptap/starter-kit

# With yarn
yarn add @tiptap/core @tiptap/starter-kit
```

Great, that should be enough to start. Here is the most essential code you need to get a running instance of tiptap:

```js
import { Editor } from '@tiptap/core'
import defaultExtensions from '@tiptap/starter-kit'

new Editor({
  element: document.getElementsByClassName('element'),
  extensions: defaultExtensions(),
  content: '<p>Your content.</p>',
})
```

## Vue.js

To use tiptap with Vue.js (and tools that are based on Vue.js) install the Vue.js adapter in your project:

```bash
# Using npm
npm install @tiptap/vue @tiptap/vue-starter-kit

# Using Yarn
yarn add @tiptap/vue @tiptap/vue-starter-kit
```

We even prepared a Vue.js starter kit for you. That should give you a good headstart. Create a new component and add the following content to get a basic version of tiptap:

<demo name="General/Installation" />

## CodeSandbox

CodeSandbox is an online coding environment. It’s great to fiddle around without setting up a local project and it’s great to share your code with others.

It’s also amazing for bug reports. Try to recreate a bug there and share it with us before you [file an issue on GitHub](https://github.com/ueberdosis/tiptap-next/issues/new). This helps a ton to fix bugs faster.

* [Vue.js/tiptap on CodeSandbox](https://codesandbox.io/s/vue-issue-template-h0g28)

## CDN

> ⚠️ This is broken and doesn’t work. Don’t use it. We are working on it.

```html
<script src="https://cdn.jsdelivr.net/npm/tiptap@1.29.4/dist/tiptap.min.js"></script>
```