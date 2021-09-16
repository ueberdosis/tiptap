# extendMarkRange
The `extendMarkRange` command expands the current selection to encompass the current mark. If the current selection doesn’t have the specified mark, nothing changes.

## Parameters
`typeOrName: string | MarkType`

Name or type of the mark.

`attributes?: Record<string, any>`

Optionally, you can specify attributes that the extented mark must contain.

## Usage
```js
// Expand selection to link marks
editor.commands.extendMarkRange('link')

// Expand selection to link marks with specific attributes
editor.commands.extendMarkRange('link', { href: 'https://google.com' })

// Expand selection to link mark and update attributes
editor
  .chain()
  .extendMarkRange('link')
  .updateAttributes('link', {
    href: 'https://duckduckgo.com'
  })
  .run()
```
