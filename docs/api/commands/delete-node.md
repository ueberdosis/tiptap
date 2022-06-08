# deleteNode
The `deleteNode` command deletes a node inside the current selection. It requires a `typeOrName` argument, which can be a string or a `NodeType` to find the node that needs to be deleted. After deleting the node, the view will automatically scroll to the cursors position.

## Parameters
`typeOrName: string | NodeType`

## Usage
```js
// deletes a paragraph node
editor.commands.deleteNode('paragraph')

// or

// deletes a custom node
editor.commands.deleteNode(MyCustomNode)
```
