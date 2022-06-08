# toggleWrap
`toggleWrap` wraps the current node with a new node or removes a wrapping node.

## Parameters
`typeOrName: string | NodeType`

The type of node that should be used for the wrapping node.

`attributes?: Record<string, any>`

The attributes that should be applied to the node. **This is optional.**

## Usage
```js
// toggle wrap the current selection with a heading node
editor.commands.toggleWrap('heading', { level: 1 })
```
