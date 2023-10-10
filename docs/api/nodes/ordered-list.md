---
description: If a bullet list doesn’t look serious enough, put some numbers in front of it.
icon: list-ordered
---

# OrderedList
[![Version](https://img.shields.io/npm/v/@tiptap/extension-ordered-list.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-ordered-list)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-ordered-list.svg)](https://npmcharts.com/compare/@tiptap/extension-ordered-list?minimal=true)

This extension enables you to use ordered lists in the editor. They are rendered as `<ol>` HTML tags.

Type <code>1.&nbsp;</code> (or any other number followed by a dot) at the beginning of a new line and it will magically transform to a ordered list.

## Installation
```bash
npm install @tiptap/extension-ordered-list @tiptap/extension-list-item
```

This extension requires the [`ListItem`](/api/nodes/list-item) node.

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
OrderedList.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### itemTypeName
Specify the list item name.

Default: `'listItem'`

```js
OrderedList.configure({
  itemTypeName: 'listItem',
})
```

### keepMarks
Decides whether to keep the marks from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

```js
OrderedList.configure({
  keepMarks: true,
})
```
### keepAttributes
Decides whether to keep the attributes from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

```js
OrderedList.configure({
  keepAttributes: true,
})
```

## Commands

### toggleOrderedList()
Toggle an ordered list.

```js
editor.commands.toggleOrderedList()
```

## Keyboard shortcuts
| Command           | Windows/Linux                   | macOS                       |
| ----------------- | ------------------------------- | --------------------------- |
| toggleOrderedList | `Control`&nbsp;`Shift`&nbsp;`7` | `Cmd`&nbsp;`Shift`&nbsp;`7` |

## Source code
[packages/extension-ordered-list/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-ordered-list/)

## Usage
https://embed.tiptap.dev/preview/Nodes/OrderedList
