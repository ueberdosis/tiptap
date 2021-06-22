# Interactive node views

## toc

## Introduction
Node views are the best thing since sliced bread, at least if you are a fan of customization (and bread). With node views you can add interactive nodes to your editor. That can literally be everything. If you can write it in JavaScript, you can use it in your editor.

Node views are amazing to improve the in-editor experience, but can also be used in a read-only instance of tiptap. They are unrelated to the HTML output by design, so you have full control about the in-editor experience *and* the output.

## Different types of node views
Depending on what you would like to build, node views work a little bit different and can have their verify specific capabilities, but also pitfalls. The main question is: How should your custom node look like?

### Editable text
Yes, node views can have editable text, just like a regular node. That’s simple. The cursor will exactly behave like you would expect it from a regular node. Existing commands work very well with those nodes.

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

tiptap adds a `contenteditable="false"` to those by default.

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
You can even mix non-editable and editable text. That’s great to build complex things, and still use marks like bold and italic inside the editable content.

**BUT**, if there are other elements with non-editable text in your node view, the cursor can jump there. You can improve that with manually adding `contenteditable="false"` to the specific parts of your node view.

```html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view>
    <div contenteditable="false">
      non-editable text
    </div>
    <div>
      editable text
    </div>
  </node-view>
  <p>text</p>
</div>
```

## Markup
But what happens if you [access the editor content](/guide/output)? If you’re working with HTML, you’ll need to tell tiptap how your node should be serialized.

The editor **does not** export the rendered JavaScript node, and for a lot of use cases you wouldn’t want that anyway.

Let’s say you have a node view which lets users add a video player and configure the appearance (autoplay, controls …). You want the interface to do that in the editor, not in the output of the editor. The output of the editor should probably only have the video player.

I know, I know, it’s not that easy. Just keep in mind, that you‘re in full control of the rendering inside the editor and of the output.

:::warning What if you store JSON?
That doesn’t apply to JSON. In JSON, everything is stored as an object. There is no need to configure the “translation” to and from HTML.
:::

### Render HTML
Okay, you’ve set up your node with an interactive node view and now you want to control the output. Even if you’re node view is pretty complex, the rendered HTML can be simple:

```js
renderHTML({ HTMLAttributes }) {
  return ['my-custom-node', mergeAttributes(HTMLAttributes)]
},

// Output: <my-custom-node count="1"></my-custom-node>
```

Make sure it’s something distinguishable, so it’s easier to restore the content from the HTML. If you just need something generic markup like a `<div>` consider to add a `data-type="my-custom-node"`.

### Parse HTML
The same applies to restoring the content. You can configure what markup you expect, that can be something completely unrelated to the node view markup. It just needs to contain all the information you want to restore.

Attributes are automagically restored, if you registered them through [`addAttributes`](/guide/custom-extensions#attributes).

```js
// Input: <my-custom-node count="1"></my-custom-node>

parseHTML() {
  return [{
    tag: 'my-custom-node',
  }]
},
```

### Render JavaScript/Vue/React
But what if you want to render your actual JavaScript/Vue/React code? Consider using tiptap to render your output. Just set the editor to `editable: false` and no one will notice you’re using an editor to render the content. :-)

<!-- ## Reference

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
> Called when the node view is removed from the editor or the whole editor is destroyed. -->
