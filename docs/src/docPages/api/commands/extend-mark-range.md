# extendMarkRange
The `extendMarkRange` command expands the current selection to encompass the bounds of a current mark. If the current selection has no marks, the selection won't be altered. Additionally, if no mark `typeOrName` is provided, the selection can't be expanded, as it's impossible to know _which_ mark's range to use.

## Parameters
`typeOrName: string`

## Usage
```js
// Expand selection to include the rest of a link
editor.commands.extendMarkRange("link")
```

