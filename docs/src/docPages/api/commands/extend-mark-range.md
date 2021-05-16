# clearContent
The `extendMarkRange` command expands the current selection to encompas the bounds of a current mark.

Note that if the current selection has no marks, the selection won't be altered. Additionally, if no mark type or name is provided, the selection can't be expanded, as it's impossible to know _which_ mark to use when extending the range.

## Parameters
`typeOrName: string`

## Usage
```js
// Expand selection to include the rest of a link
editor.commands.extendMarkRange("link")
```

