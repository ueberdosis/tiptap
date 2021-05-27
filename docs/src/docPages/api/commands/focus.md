# focus
This command sets the focus back to the editor.

When a user clicks on a button outside the editor, the browser sets the focus to that button. In most scenarios you want to focus the editor then again. That’s why you’ll see that in basically every demo here.

See also: [setTextSelection](/api/commands/set-text-selection)

## Parameters
`position: 'start' | 'end' | number | boolean | null (false)`

By default, it’s restoring the cursor position (and text selection). Pass a position to move the cursor too.

## Usage
```js
// Set the focus to the editor
editor.commands.focus()

// Set the cursor to the first position
editor.commands.focus('start')

// Set the cursor to the last position
editor.commands.focus('end')

// Set the cursor to position 10
editor.commands.focus(10)
```
