# Complex node views

## toc

## Introduction
Node views are the best thing since sliced bread, at least if you’re a fan of customization (and bread). Node views enable you to add literally anything to a node. If you can write it in JavaScript, you can use it in your editor.

<!-- ```js
import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue'
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
``` -->

## Different types of node views

### Simple

```html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view>text</node-view>
  <p>text</p>
</div>
```

#### Example: Task item

https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-task-item/src/task-item.ts#L74

### Without content

```html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view contenteditable="false">text</node-view>
  <p>text</p>
</div>
```

#### Example: Table of contents
<demo name="Guide/NodeViews/TableOfContents" />

#### Example: Drawing in the editor
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

#### Example: Drag handles
<demo name="Guide/NodeViews/DragHandle" />

## Render Vue components

### Node

```js
import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue'
import Component from './Component.vue'

export default Node.create({
  addNodeView() {
    return VueNodeViewRenderer(Component)
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

### Component with Content

```html
<template>
  <node-view-wrapper class="dom">
    <node-view-content class="content-dom" />
  </node-view-wrapper>
</template>
```
