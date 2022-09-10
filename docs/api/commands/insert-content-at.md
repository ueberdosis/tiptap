# insertContentAt
The `insertContentAt` will insert a string of html or a node at a given position or range. If a range is given, the new content will replace the content in the given range with the new content.

## Parameters
`position: number | Range`

The position or range the content will be inserted in.

`value: Content`

The content to be inserted. Can be a string of HTML or a node.

`options: Record<string, any>`

* updateSelection: controls if the selection should be moved to the newly inserted content.
* parseOptions: Passed content is parsed by ProseMirror. To hook into the parsing, you can pass `parseOptions` which are then handled by [ProseMirror](https://prosemirror.net/docs/ref/#model.ParseOptions).

## Usage
```js
editor.commands.insertContentAt(12, '<p>Hello world</p>', {
  updateSelection: true,
  parseOptions: {
    preserveWhitespace: 'full',
  }
})
```
