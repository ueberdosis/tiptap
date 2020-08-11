# Installation

tiptap has a very modular package structure and is independent of any framework. If you want to start as fast as possible, you need at least the two packages `@tiptap/core` and `@tiptap/starter-kit`.

```bash
# Using npm
npm install @tiptap/core @tiptap/starter-kit

# Using Yarn
yarn add @tiptap/core @tiptap/starter-kit
```

You can use it like this:

## Vanilla JavaScript

```js
import { Editor } from '@tiptap/core'
import extensions from '@tiptap/starter-kit'

new Editor({
  element: document.getElementsByClassName('element'),
  extensions: extensions(),
  content: '<p>Hey there.</p>',
})
```

* Play with tiptap on [CodeSandbox](https://codesandbox.io/s/vue-issue-template-h0g28)

## Vue.js

To use tiptap with Vue.js and tools that are based on Vue.js install the Vue.js adapter in your project:

```bash
# Using npm
npm install @tiptap/core @tiptap/starter-kit @tiptap/vue

# Using Yarn
yarn add @tiptap/core @tiptap/starter-kit @tiptap/vue
```

Create a new component and add the following content to get a basic version of tiptap:

<demo name="VueSetup" />

* Read more about [Using tiptap with Vue.js](/basic-vue-example/)
* Play with tiptap on [CodeSandbox](https://codesandbox.io/s/vue-issue-template-h0g28)

## React

```js
// TODO
```

* Play with tiptap on [CodeSandbox](https://codesandbox.io/s/vue-issue-template-h0g28)

## CDN

// TODO