# clearContent
The `clearContent` command deletes the current document.

Keep in mind that the editor will enforce the configured schema, and the document won’t be `null`. The default [`Document`](/api/nodes/document) expects to have at least one block node, which is the paragraph by default. In other words: Even after running that command the document will have at least one (empty) paragraph.

See also: [setContent](/api/commands/set-content), [insertContent](/api/commands/insert-content)

## Parameters

`emitUpdate: Boolean (false)`

By default, it doesn’t trigger the update event. Passing `true` doesn’t prevent triggering the update event.

## Usage

```js
// Remoe all content from the document
this.editor.commands.clearContent()

// Remove all content, and trigger the `update` event
this.editor.commands.clearContent(true)
```

