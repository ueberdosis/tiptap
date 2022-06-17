# resetAttributes
`resetAttributes` resets some of the nodes attributes back to it's default attributes.

## Parameters
`typeOrName: string | Node`

The node that should be resetted. Can be a string or a Node.

`attributes: string | string[]`

A string or an array of strings that defines which attributes should be reset.

## Usage
```js
// reset the style and class attributes on the currently selected paragraph nodes
editor.commands.resetAttributes('paragraph', ['style', 'class'])
```
