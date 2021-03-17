# Node views with JavaScript

## toc

## Introduction
TODO

## Code snippet
```js
import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-2'
import Component from './Component.vue'

export default Node.create({
  addNodeView() {
    return ({ editor, node, getPos, HTMLAttributes, decorations, extension }) => {
      const dom = document.createElement('div')

      dom.innerHTML = 'Hello, I’m a node view!'

      return {
        dom,
      }
    }
  },
})
```

## Render markup
<demo name="Guide/NodeViews/JavaScript" />

## Access node attributes
TODO

## Update node attributes
TODO

## Adding a content editable
TODO

## All available props
TODO
