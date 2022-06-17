# wrapInList
`wrapInList` will wrap a node in the current selection in a list.

## Parameters
`typeOrName: string | NodeType`

The type of node that should be wrapped in a list.

`attributes?: Record<string, any>`

The attributes that should be applied to the list. **This is optional.**

## Usage
```js
// wrap a paragraph in a bullet list
editor.commands.wrapInList('paragraph')
```
