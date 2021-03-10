# Interactive node views

## toc

## Introduction
Node views are the best thing since sliced bread, at least if you are a fan of customization (and bread). With node views you can add interactive nodes to your editor content. That can literally be everything. If you can write it in JavaScript, you can use it in your editor.

## Different types of node views
Depending on what you would like to build, node views work a little bit different and can have their verify specific capabilities, but also pitfalls. The main question is: How should your custom node look like?

### Editable text
Yes, node views can have editable text, just like regular node. That’s simple. The cursor will exactly behave like you would expect it from a regular node. Existing commands work very well with those nodes.

```html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view>text</node-view>
  <p>text</p>
</div>
```

That’s how the [`TaskItem`](/api/nodes/task-item) node works.

### Non-editable text
Nodes can also have text, which is not edtiable. The cursor can’t jump into those, but you don’t want that anyway.

Those just get a `contenteditable="false"` from tiptap by default.

```html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view contenteditable="false">text</node-view>
  <p>text</p>
</div>
```

That’s how you could render mentions, which shouldn’t be editable. Users can add or delete them, but not delete single characters.

Statamic uses those for their Bard editor, which renders complex modules inside tiptap, which can have their own text inputs.

### Mixed content
You can even mix non-editable and editable text. That’s great because you can build complex things, and even use marks like bold and italic inside the editable content.

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

**BUT**, if there are other elements with non-editable text in your node view, the cursor can jump there. You can improve that with manually adding `contenteditable` attributes to the specific parts of your node view.

```html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view contenteditable="false">
    <div>
      non-editable text
    </div>
    <div contenteditable="true">
      editable text
    </div>
  </node-view>
  <p>text</p>
</div>
```

**BUT**, that also means the cursor can’t just move from outside of the node view to the inside. Users have to manually place their cursor to edit the content inside the node view. Just so you know.

## Node views with JavaScript
TODO

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
    })
  },
})
```

## Node views with Vue
Using Vanilla JavaScript can feel complex if you are used to work in Vue. Good news: You can use regular Vue components in your node views, too. There is just a little bit you need to know, but let’s go through this one by one.

### Render a Vue component
Here is what you need to do to render Vue components inside your text editor:

1. [Create a node extension](/guide/build-extensions)
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

<demo name="Guide/NodeViews/VueComponent" />

That component doesn’t interactive with the editor, though. Time to connect it to the editor output.

### Access node attributes
The `VueNodeViewRenderer` which you use in your node extension, passes a few very helpful props to your custom view component. One of them is the `node` prop. Add this snippet to your Vue component to directly access the node:

```js
props: {
  node: {
    type: Object,
    required: true,
  },
},
```

That makes it super easy to access node attributes in your Vue component. Let’s say you have [added an attribute](/guide/extend-extensions#attributes) named `count` to your node extension (like we did in the above example) you could access it like this:

```js
this.node.attrs.count
```

### Update node attributes
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

### Adding a content editable
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
```

You don’t need to add those `class` attributes, feel free to remove them or pass other class names. Try it out in the following example:

<demo name="Guide/NodeViews/VueComponentContent" />

Keep in mind that this content is rendered by tiptap. That means you need to tell what kind of content is allowed, for example with `content: 'inline*'` in your node extension (that’s what we use in the above example).

### All available props
For advanced use cases, we pass a few more props to the component. Here is the full list of what you can expect:

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

    // true when the cursor is inside the node view
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
  },
}
</script>
```

## Node views with React
TODO

## Rendered content

```js
parseHTML() {
  return [{
    tag: 'vue-component',
  }]
},

renderHTML({ HTMLAttributes }) {
  return ['vue-component', mergeAttributes(HTMLAttributes)]
},
```

## Examples
We’ve put together [a list of interactive examples](/guide/node-views/examples). :-)

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
