# toggleNode
`toggleNode` will a node with another node.

## Parameters
`typeOrName: string | NodeType`

The type of node that should be toggled.

`toggleTypeOrName: string | NodeType`

The type of node that should be used for the toggling.

`attributes?: Record<string, any>`

The attributes that should be applied to the node. **This is optional.**

## Usage
```js
// toggle a paragraph with a heading node
editor.commands.toggleNode('paragraph', 'heading', { level: 1 })

// toggle a paragraph with a image node
editor.commands.toggleNode('paragraph', 'image', { src: 'https://example.com/image.png' })
```
