# setTextSelection
If you think of selection in the context of an editor, you’ll probably think of a text selection. With `setTextSelection` you can control that text selection and set it to a specified range or position.

See also: [focus](/api/commands/focus), [setNodeSelection](/api/commands/set-node-selection), [deleteSelection](/api/commands/delete-selection), [selectAll](/api/commands/select-all)

## Parameters
`position: number | Range`

Pass a number, or a Range, for example `{ from: 5, to: 10 }`.

## Usage
```js
// Set the cursor to the specified position
editor.commands.setTextSelection(10)

// Set the text selection to the specified range
editor.commands.setTextSelection({ from: 5, to: 10 })
```

