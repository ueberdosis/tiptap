# toggleMark
The `toggleMark` command toggles a specific mark on and off at the current selection.

## Parameters
`typeOrName: string | MarkType`

The type of mark that should be toggled.

`attributes?: Record<string, any>`

The attributes that should be applied to the mark. **This is optional.**

`options?: Record<string, any>`
* `extendEmptyMarkRange: boolean` - Removes the mark even across the current selection. Defaults to `false`

## Usage
```js
// toggles a bold mark
editor.commands.toggleMark('bold')

// toggles bold mark with a color attribute
editor.commands.toggleMark('bold', { color: 'red' })

// toggles a bold mark with a color attribute and removes the mark across the current selection
editor.commands.toggleMark('bold', { color: 'red' }, { extendEmptyMarkRange: true })
```
