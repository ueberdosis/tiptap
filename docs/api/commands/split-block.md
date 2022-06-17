# splitBlock
`splitBlock` will split the current node into two nodes at the current [NodeSelection](https://prosemirror.net/docs/ref/#state.NodeSelection). If the current selection is not splittable, the command will be ignored.

## Parameters
`options: Record<string, any>`

* `keepMarks: boolean` - Defines if the marks should be kept or removed. Defaults to `true`.

## Usage
```js
// split the current node and keep marks
editor.commands.splitBlock()

// split the current node and don't keep marks
editor.commands.splitBlock({ keepMarks: false })
```
