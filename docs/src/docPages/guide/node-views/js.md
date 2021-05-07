# Node views with JavaScript

## toc

## Introduction
Using frameworks like Vue or React can feel too complex, if you’re used to work without those two. Good news: You can use Vanilla JavaScript in your node views. There is just a little bit you need to know, but let’s go through this one by one.

## Render a node view with JavaScript
Here is what you need to do to render a node view inside your editor:

1. [Create a node extension](/guide/custom-extensions)
2. Register a new node view with `addNodeView()`
3. Write your render function
4. [Configure tiptap to use your new node extension](/guide/configuration)

This is how your node extension could look like:

```js
import { Node } from '@tiptap/core'
import Component from './Component.vue'

export default Node.create({
  // configuration …

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

Got it? Let’s see it in action. Feel free to copy the below example to get started.

<demo name="Guide/NodeViews/JavaScript" />

That node view even interacts with the editor. Time to see how that is wired up.

## Access node attributes
The editor passes a few helpful things to your render function. One of them is the the `node` prop. This one enables you to access node attributes in your node view. Let’s say you have [added an attribute](/guide/custom-extensions#attributes) named `count` to your node extension. You could access the attribute like this:

```js
addNodeView() {
  return ({ node }) => {
    console.log(node.attrs.count)

    // …
  }
}
```


## Update node attributes
You can even update node attributes from your node view, with the help of the `getPos` prop passed to your render function. Dispatch a new transaction with an object of the updated attributes:

```js
addNodeView() {
  return ({ editor, node, getPos }) => {
    const { view } = editor

    // Create a button …
    const button = document.createElement('button')
    button.innerHTML = `This button has been clicked ${node.attrs.count} times.`

    // … and when it’s clicked …
    button.addEventListener('click', () => {
      if (typeof getPos === 'function') {
        // … dispatch a transaction, for the current position in the document …
        view.dispatch(view.state.tr.setNodeMarkup(getPos(), undefined, {
          count: node.attrs.count + 1,
        }))

        // … and set the focus back to the editor.
        editor.commands.focus()
      }
    })

    // …
  }
}
```

Does seem a little bit too complex? Consider using [React](/guide/node-views/react) or [Vue](/guide/node-views/vue), if you have one of those in your project anyway. It get’s a little bit easier with those two.

## Adding a content editable
To add editable content to your node view, you need to pass a `contentDOM`, a container element for the content. Here is a simplified version of a node view with non-editable and editable text content:

```js
// Create a container for the node view
const dom = document.createElement('div')

// Give other elements containing text `contentEditable = false`
const label = document.createElement('span')
label.innerHTML = 'Node view'
label.contentEditable = false

// Create a container for the content
const content = document.createElement('div')

// Append all elements to the node view container
dom.append(label, content)

return {
  // Pass the node view container …
  dom,
  // … and the content container:
  contentDOM: content,
}
```

Got it? You’re free to do anything you like, as long as you return a container for the node view and another one for the content. Here is the above example in action:

<demo name="Guide/NodeViews/JavaScriptContent" />

Keep in mind that this content is rendered by tiptap. That means you need to tell what kind of content is allowed, for example with `content: 'inline*'` in your node extension (that’s what we use in the above example).


