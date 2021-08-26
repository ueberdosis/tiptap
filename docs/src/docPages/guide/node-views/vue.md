---
tableOfContents: true
---

# Node views with Vue

## toc

## Introduction
Using Vanilla JavaScript can feel complex if you are used to work in Vue. Good news: You can use regular Vue components in your node views, too. There is just a little bit you need to know, but let’s go through this one by one.

## Render a Vue component
Here is what you need to do to render Vue components inside your editor:

1. [Create a node extension](/guide/custom-extensions)
2. Create a Vue component
3. Pass that component to the provided `VueNodeViewRenderer`
4. Register it with `addNodeView()`
5. [Configure tiptap to use your new node extension](/guide/configuration)

This is how your node extension could look like:

```js
import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-2'
import Component from './Component.vue'

export default Node.create({
  // configuration …

  addNodeView() {
    return VueNodeViewRenderer(Component)
  },
})
```

There is a little bit of magic required to make this work. But don’t worry, we provide a wrapper component you can use to get started easily. Don’t forget to add it to your custom Vue component, like shown below:

```html
<template>
  <node-view-wrapper>
    Vue Component
  </node-view-wrapper>
</template>
```

Got it? Let’s see it in action. Feel free to copy the below example to get started.

<tiptap-demo name="GuideNodeViews/VueComponent"></tiptap-demo>

That component doesn’t interact with the editor, though. Time to wire it up.

## Access node attributes
The `VueNodeViewRenderer` which you use in your node extension, passes a few very helpful props to your custom Vue component. One of them is the `node` prop. Add this snippet to your Vue component to directly access the node:

```js
props: {
  node: {
    type: Object,
    required: true,
  },
},
```

That enables you to access node attributes in your Vue component. Let’s say you have [added an attribute](/guide/custom-extensions#attributes) named `count` to your node extension (like we did in the above example) you could access it like this:

```js
this.node.attrs.count
```

## Update node attributes
You can even update node attributes from your node, with the help of the `updateAttributes` prop passed to your component. Just add this snippet to your component:

```js
props: {
  updateAttributes: {
    type: Function,
    required: true,
  },
},
```

Pass an object with updated attributes to the function:

```js
this.updateAttributes({
  count: this.node.attrs.count + 1,
})
```

And yes, all of that is reactive, too. A pretty seemless communication, isn’t it?

## Adding a content editable
There is another component called `NodeViewContent` which helps you adding editable content to your node view. Here is an example:

```html
<template>
  <node-view-wrapper class="dom">
    <node-view-content class="content-dom" />
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-2'

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },
}
</script>
```

You don’t need to add those `class` attributes, feel free to remove them or pass other class names. Try it out in the following example:

<tiptap-demo name="GuideNodeViews/VueComponentContent"></tiptap-demo>

Keep in mind that this content is rendered by tiptap. That means you need to tell what kind of content is allowed, for example with `content: 'inline*'` in your node extension (that’s what we use in the above example).

The `NodeViewWrapper` and `NodeViewContent` components render a `<div>` HTML tag (`<span>` for inline nodes), but you can change that. For example `<node-view-content as="p">` should render a paragraph. One limitation though: That tag must not change during runtime.

## All available props
For advanced use cases, we pass a few more props to the component. Here is the full list of what props you can expect:

```html
<template>
  <node-view-wrapper />
</template>

<script>
import { NodeViewWrapper } from '@tiptap/vue-2'

export default {
  components: {
    NodeViewWrapper,
  },

  props: {
    // the editor instance
    editor: {
      type: Object,
    },

    // the current node
    node: {
      type: Object,
    },

    // an array of decorations
    decorations: {
      type: Array,
    },

    // `true` when there is a `NodeSelection` at the current node view
    selected: {
      type: Boolean,
    },

    // access to the node extension, for example to get options
    extension: {
      type: Object,
    },

    // get the document position of the current node
    getPos: {
      type: Function,
    },

    // update attributes of the current node
    updateAttributes: {
      type: Function,
    },

    // delete the current node
    deleteNode: {
      type: Function,
    },
  },
}
</script>
```

If you just want to have all (and to have TypeScript support) you can import all props like that:

```js
// Vue 3
import { defineComponent } from 'vue'
import { nodeViewProps } from '@tiptap/vue-3'
export default defineComponent({
  props: nodeViewProps,
})

// Vue 2
import Vue from 'vue'
import { nodeViewProps } from '@tiptap/vue-2'
export default Vue.extend({
  props: nodeViewProps,
})
```

## Dragging
To make your node views draggable, set `draggable: true` in the extension and add `data-drag-handle` to the DOM element that should function as the drag handle.

<tiptap-demo name="GuideNodeViews/DragHandle"></tiptap-demo>
