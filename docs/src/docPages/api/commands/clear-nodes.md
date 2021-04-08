# clearNodes
The `clearNodes` command normalizes nodes to the default node, which is the paragraph by default. It’ll even normalize all kind of lists. For advanced use cases it can come in handy, before applying a new node type.

If you wonder how you can define the default node: It depends on what’s in the `content` attribute of your [`Document`](/api/nodes/document), by default that’s `block+` (at least one block node) and the [`Paragraph`](/api/nodes/paragraph) node has the highest priority, so it’s loaded first and is therefore the default node.

## Usage
```js
editor.commands.clearNodes()
```

