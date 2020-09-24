# Installation
You’re free to use tiptap with the framework of your choice. Depending on what you want to do, there are a few different ways to install tiptap in your project. Choose the way that fits your workflow.

## Option 1: Vanilla JavaScript
Use tiptap with vanilla JavaScript for a very lightweight and raw experience. If you feel like it, you can even use it to connect tiptap with other frameworks not mentioned here.

```bash
# With npm
npm install @tiptap/core @tiptap/starter-kit

# Or: With Yarn
yarn add @tiptap/core @tiptap/starter-kit
```

| Package                                                                      | Description                |
| ---------------------------------------------------------------------------- | -------------------------- |
| [@tiptap/core](https://www.npmjs.com/package/@tiptap/core)                   | The actual editor          |
| [@tiptap/starter-kit](https://www.npmjs.com/package/@tiptap/vue-starter-kit) | The most common extensions |

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

## Option 2: Vue.js
To use tiptap with Vue.js (and tools that are based on Vue.js) install tiptap together with the Vue.js rendering adapter in your project. We even prepared a Vue.js starter kit, which gives you a good headstart.

```bash
# With npm
npm install @tiptap/core @tiptap/vue @tiptap/vue-starter-kit

# Or: With Yarn
yarn add @tiptap/core @tiptap/vue @tiptap/vue-starter-kit
```

| Package                                                                          | Description                                   |
| -------------------------------------------------------------------------------- | --------------------------------------------- |
| [@tiptap/core](https://www.npmjs.com/package/@tiptap/core)                       | The actual editor                             |
| [@tiptap/vue](https://www.npmjs.com/package/@tiptap/vue)                         | Rendering for Vue.js                          |
| [@tiptap/vue-starter-kit](https://www.npmjs.com/package/@tiptap/vue-starter-kit) | The most common extensions wrapped for Vue.js |

Create a new component and add the following content to get a basic version of tiptap:

<demo name="General/Installation" />

<!-- ## Option 3: CodeSandbox

CodeSandbox is an online coding environment. It’s great to fiddle around without setting up a local project and to share your code with others.

It’s also amazing for bug reports. Found it a bug? Try to recreate it there and share it with us before you [file an issue on GitHub](https://github.com/ueberdosis/tiptap-next/issues/new). That helps to fix bugs faster.

* [Vue.js/tiptap on CodeSandbox](https://codesandbox.io/s/vue-issue-template-h0g28) -->
