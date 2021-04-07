# setContent
The `setContent` command replaces the document with a new one. You can pass JSON or HTML, both work fine. It’s basically the same as setting the `content` on initialization.

See also: [insertContent](/api/commands/insert-content), [clearContent](/api/commands/clear-content)

## Parameters
`content: string`

Pass a string (JSON or HTML) as [content](/guide/output). The editor will only render what’s allowed according to the [schema](/api/schema).

`emitUpdate?: Boolean (false)`

By default, it doesn’t trigger the update event. Passing `true` doesn’t prevent triggering the update event.

`parseOptions?: AnyObject`

Options to configure the parsing can be passed during initialization and/or with setContent. Read more about parseOptions in the [ProseMirror documentation](https://prosemirror.net/docs/ref/#model.ParseOptions).

## Usage
```js
// HTML
this.editor.commands.setContent('<p>Example Text</p>')

// JSON
this.editor.commands.setContent({
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Example Text"
        }
      ]
    }
  ]
})
```

