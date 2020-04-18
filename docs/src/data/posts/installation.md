# Installation

```bash
# Using npm
npm install @tiptap/core

# Using Yarn
yarn add @tiptap/core
```

## Quick Start

```js
import { Editor } from '@tiptap/core'
import extensions from '@tiptap/starter-kit'

new Editor({
  element: document.getElementsByClassName('element'),
  extensions: extensions(),
  content: '<p>Hey there.</p>',
})
```