# toggleList
`toggleList` will toggle between different types of lists.

## Parameters
`listTypeOrName: string | NodeType`

The type of node that should be used for the wrapping list

`itemTypeOrName: string | NodeType`

The type of node that should be used for the list items

`keepMarks?: boolean`

If marks should be kept as list items or not

`attributes?: Record<string, any>`

The attributes that should be applied to the list. **This is optional.**

## Usage
```js
// toggle a bullet list with list items
editor.commands.toggleList('bullet_list', 'list_item')

// toggle a numbered list with list items
editor.commands.toggleList('ordered_list', 'list_item')
```
