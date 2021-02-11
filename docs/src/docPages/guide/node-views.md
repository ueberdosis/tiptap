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

## Reference

### dom: ?⁠dom.Node
> The outer DOM node that represents the document node. When not given, the default strategy is used to create a DOM node.

### contentDOM: ?⁠dom.Node
> The DOM node that should hold the node's content. Only meaningful if the node view also defines a dom property and if its node type is not a leaf node type. When this is present, ProseMirror will take care of rendering the node's children into it. When it is not present, the node view itself is responsible for rendering (or deciding not to render) its child nodes.

### update: ?⁠fn(node: Node, decorations: [Decoration]) → bool
> When given, this will be called when the view is updating itself. It will be given a node (possibly of a different type), and an array of active decorations (which are automatically drawn, and the node view may ignore if it isn't interested in them), and should return true if it was able to update to that node, and false otherwise. If the node view has a contentDOM property (or no dom property), updating its child nodes will be handled by ProseMirror.

### selectNode: ?⁠fn()
> Can be used to override the way the node's selected status (as a node selection) is displayed.

### deselectNode: ?⁠fn()
> When defining a selectNode method, you should also provide a deselectNode method to remove the effect again.

### setSelection: ?⁠fn(anchor: number, head: number, root: dom.Document)
> This will be called to handle setting the selection inside the node. The anchor and head positions are relative to the start of the node. By default, a DOM selection will be created between the DOM positions corresponding to those positions, but if you override it you can do something else.

### stopEvent: ?⁠fn(event: dom.Event) → bool
> Can be used to prevent the editor view from trying to handle some or all DOM events that bubble up from the node view. Events for which this returns true are not handled by the editor.

### ignoreMutation: ?⁠fn(dom.MutationRecord) → bool
> Called when a DOM mutation or a selection change happens within the view. When the change is a selection change, the record will have a type property of "selection" (which doesn't occur for native mutation records). Return false if the editor should re-read the selection or re-parse the range around the mutation, true if it can safely be ignored.

### destroy: ?⁠fn()
> Called when the node view is removed from the editor or the whole editor is destroyed.
