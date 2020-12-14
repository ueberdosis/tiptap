# Complex node views

## toc

## Introduction

TODO

```js
import { Node } from '@tiptap/core'
import { VueRenderer } from '@tiptap/vue'
import Component from './Component.vue'

export default Node.create({
  addNodeView() {
    return ({ editor, node, getPos, HTMLAttributes, decorations, extension }) => {
      const dom = document.createElement('div')

      dom.innerHTML = 'I’m a node view'

      return {
        dom,
      }
    })
  },
})
```

## Different types of node views

### Simple

```html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view>text</node-view>
  <p>text</p>
</div>
```

### Without content

```html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view contenteditable="false">text</node-view>
  <p>text</p>
</div>
```

<demo name="Guide/NodeViews/TableOfContents" />

<demo name="Examples/Drawing" />

### Advanced node views with content

```html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view>
    <div>
      non-editable text
    </div>
    <div>
      editable text
    </div>
  </node-view>
  <p>text</p>
</div>
```

<demo name="Guide/NodeViews/DragHandle" />

## Render Vue components

### Node

```js
import { Node } from '@tiptap/core'
import { VueRenderer } from '@tiptap/vue'
import Component from './Component.vue'

export default Node.create({
  addNodeView() {
    return VueRenderer(Component)
  },
})
```

### Component

```html
<template>
  <node-view-wrapper>
    <node-view-content />
  </node-view-wrapper>
</template>

<script>
export default {
  props: {
    editor: {
      type: Object,
    },

    node: {
      type: Object,
    },

    decorations: {
      type: Array,
    },

    selected: {
      type: Boolean,
    },

    extension: {
      type: Object,
    },

    getPos: {
      type: Function,
    },

    updateAttributes: {
      type: Function,
    },
  },
}
</script>
```
