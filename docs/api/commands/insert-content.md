# insertContent
The `insertContent` command adds the passed value to the document.

See also: [setContent](/api/commands/set-content), [clearContent](/api/commands/clear-content)

## Parameters
`value: Content`

The command is pretty flexible and takes plain text, HTML or even JSON as a value.

## Usage
```js
// Plain text
editor.commands.insertContent('Example Text')

// HTML
editor.commands.insertContent('<h1>Example Text</h1>')

// HTML with trim white space
editor.commands.insertContent('<h1>Example Text</h1>', 
{
  parseOptions: {
    preserveWhitespace: false,
  }
})

// JSON/Nodes
editor.commands.insertContent({
  type: 'heading',
  attrs: {
    level: 1,
  },
  content: [
    {
      type: 'text',
      text: 'Example Text',
    },
  ],
})

// Multiple nodes at once
editor.commands.insertContent([
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'First paragraph',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Second paragraph',
      },
    ],
  },
])
```

