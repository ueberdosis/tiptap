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

→ codesandbox

## Vue.js

```js
import { Editor } from '@tiptap/core'
import extensions from '@tiptap/starter-kit'

new Editor({
  element: document.getElementsByClassName('element'),
  extensions: extensions(),
  content: '<p>Hey there.</p>',
})
```

→ codesandbox

## react

```js
import { Editor } from '@tiptap/core'
import extensions from '@tiptap/starter-kit'

new Editor({
  element: document.getElementsByClassName('element'),
  extensions: extensions(),
  content: '<p>Hey there.</p>',
})
```

→ codesandbox

## cdn?