# splitListItem
`splitListItem` splits one list item into two separate list items. If this is a nested list, the wrapping list item should be split.

## Parameters
`typeOrName: string | NodeType`

The type of node that should be split into two separate list items.

## Usage
```js
editor.commands.splitListItem('bullet_list')
```
