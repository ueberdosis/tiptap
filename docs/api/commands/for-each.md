# forEach
Loop through an array of items.

## Parameters
`items: any[]`

An array of items.

`fn: (item: any, props: CommandProps & { index: number }) => boolean`

A function to do anything with your item.

## Usage
```js
const items = ['foo', 'bar', 'baz']

editor.commands.forEach(items, (item, { commands }) => {
  return commands.insertContent(item)
})
```
