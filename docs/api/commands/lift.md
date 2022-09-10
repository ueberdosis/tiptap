# lift
The `lift` command lifts a given node up into it's parent node. **Lifting** means, that the block will be moved to the parent of the block it is currently in.

## Parameters
`typeOrName: String | NodeType`

The node that should be lifted. If the node is not found in the current selection, ignore the command.

`attributes: Record<string, any>`

The attributes the node should have to be lifted. This is **optional**.

## Usage
```js
// lift any headline
editor.commands.lift('headline')

// lift only h2
editor.commands.lift('headline', { level: 2 })
```
