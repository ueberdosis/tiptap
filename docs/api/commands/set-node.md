# setNode
The `setNode` command will replace a given range with a given node. The range depends on the current selection. **Important**: Currently `setNode` only supports text block nodes.

## Parameters

`typeOrName: string | NodeType`

The type of the node that will replace the range. Can be a string or a NodeType.

`attributes?: Record<string, any>`

The attributes that should be applied to the node. **This is optional.**

## Usage
```js
editor.commands.setNode("paragraph", { id: "paragraph-01" })
```
