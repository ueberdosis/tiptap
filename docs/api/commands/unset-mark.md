# unsetMark
`unsetMark` will remove the mark from the current selection. Can also remove all marks across the current selection.

## Parameters
`typeOrName: string | MarkType`

The type of mark that should be removed.

`options?: Record<string, any>`

* `extendEmptyMarkRange?: boolean` - Removes the mark even across the current selection. Defaults to `false`

## Usage
```js
// removes a bold mark
editor.commands.unsetMark('bold')

// removes a bold mark across the current selection
editor.commands.unsetMark('bold', { extendEmptyMarkRange: true })
```
