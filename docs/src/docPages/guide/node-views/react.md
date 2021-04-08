# Node views with React

## toc

## Introduction
Using plain JavaScript can feel complex if you are used to work in React. Good news: You can use regular React components in your node views, too. There is just a little bit you need to know, but let’s go through this one by one.

## Render a React component
Here is what you need to do to render React components inside your editor:

1. [Create a node extension](/guide/custom-extensions)
2. Create a React component
3. Pass that component to the provided `ReactNodeViewRenderer`
4. Register it with `addNodeView()`
5. [Configure tiptap to use your new node extension](/guide/configuration)

This is how your node extension could look like:

```js
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Component from './Component.jsx'

export default Node.create({
  // configuration …

  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})
```

There is a little bit of magic required to make this work. But don’t worry, we provide a wrapper component you can use to get started easily. Don’t forget to add it to your custom React component, like shown below:

```html
<NodeViewWrapper className="react-component">
  React Component
</NodeViewWrapper>
```

Got it? Let’s see it in action. Feel free to copy the below example to get started.

<demo name="Guide/NodeViews/ReactComponent" />

That component doesn’t interact with the editor, though. Time to wire it up.

## Access node attributes
The `ReactNodeViewRenderer` which you use in your node extension, passes a few very helpful props to your custom React component. One of them is the `node` prop. Let’s say you have [added an attribute](/guide/extend-extensions#attributes) named `count` to your node extension (like we did in the above example) you could access it like this:

```js
props.node.attrs.count
```

## Update node attributes
You can even update node attributes from your node, with the help of the `updateAttributes` prop passed to your component. Pass an object with updated attributes to the `updateAttributes` prop:

```js
export default props => {
  const increase = () => {
    props.updateAttributes({
      count: props.node.attrs.count + 1,
    })
  }

  // …
}
```

And yes, all of that is reactive, too. A pretty seemless communication, isn’t it?

## Adding a content editable
There is another component called `NodeViewContent` which helps you adding editable content to your node view. Here is an example:

```js
import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'

export default () => {
  return (
    <NodeViewWrapper className="react-component-with-content">
      <span className="label" contentEditable={false}>React Component</span>

      <NodeViewContent className="content" />
    </NodeViewWrapper>
  )
}
```

You don’t need to add those `className` attributes, feel free to remove them or pass other class names. Try it out in the following example:

<demo name="Guide/NodeViews/ReactComponentContent" />

Keep in mind that this content is rendered by tiptap. That means you need to tell what kind of content is allowed, for example with `content: 'inline*'` in your node extension (that’s what we use in the above example).

The `NodeViewWrapper` and `NodeViewContent` components render a `<div>` HTML tag (`<span>` for inline nodes), but you can change that. For example `<NodeViewContent as="p">` should render a paragraph. One limitation though: That tag must not change during runtime.

## All available props
Here is the full list of what props you can expect:

| Prop               | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `editor`           | The editor instance                                      |
| `node`             | The current node                                         |
| `decorations`      | An array of decorations                                  |
| `selected`         | `true` when the cursor is inside the node view           |
| `extension`        | Access to the node extension, for example to get options |
| `getPos`           | Get the document position of the current node            |
| `updateAttributes` | Update attributes of the current node                    |
