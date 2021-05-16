# extendMarkRange
The `extendMarkRange` command expands the current selection to encompass the current mark. If the current selection doesn't have the specified mark, nothing changes. If the selection contains multiple marks of the specified type, the first one is selected. `typeOrName` is required, since it's impossible to know _which_ mark's range to use without it.

## Parameters
`typeOrName: string`

## Usage
```js
// Expand selection to include the rest of a link
editor.commands.extendMarkRange("link")
```

