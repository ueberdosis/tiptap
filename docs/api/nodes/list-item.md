# ListItem
[![Version](https://img.shields.io/npm/v/@tiptap/extension-list-item.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-list-item)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-list-item.svg)](https://npmcharts.com/compare/@tiptap/extension-list-item?minimal=true)

The ListItem extension adds support for the `<li>` HTML tag. It’s used for bullet lists and ordered lists and can’t really be used without them.

## Installation
```bash
# with npm
npm install @tiptap/extension-list-item

# with Yarn
yarn add @tiptap/extension-list-item
```

This extension requires the [`BulletList`](/api/nodes/bullet-list) or [`OrderedList`](/api/nodes/ordered-list) node.

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
ListItem.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## Keyboard shortcuts
| Command         | Windows/Linux      | macOS              |
| --------------- | ------------------ | ------------------ |
| splitListItem() | `Enter`            | `Enter`            |
| sinkListItem()  | `Tab`              | `Tab`              |
| liftListItem()  | `Shift`&nbsp;`Tab` | `Shift`&nbsp;`Tab` |

## Source code
[packages/extension-list-item/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-list-item/)

## Usage
<tiptap-demo name="Nodes/ListItem"></tiptap-demo>
