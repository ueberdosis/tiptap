# insertContent

## Parameters

## Usage

```js
this.editor.commands.insertContent('text')
this.editor.commands.insertContent('<p>HTML</p>')
this.editor.commands.insertContent({
  type: 'heading',
  attrs: {
    level: 2,
  },
  content: [
    {
      type: 'text',
      text: 'nested nodes',
    },
  ],
})
```

