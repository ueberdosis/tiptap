# cut
This command cuts out content and places it into the given position.

See also: [focus](/api/commands/cut)

## Usage
```js
const from = editor.state.selection.from
const to = editor.state.selection.to

const endPos = editor.state.doc.nodeSize - 2

// Cut out content from range and put it at the end of the document
editor.commands.cut({ from, to }, endPos)
```

