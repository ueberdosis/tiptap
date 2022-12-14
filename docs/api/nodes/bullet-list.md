---
description: Everything looks more serious with a few bullet points.
icon: list-unordered
---

# BulletList
[![Version](https://img.shields.io/npm/v/@tiptap/extension-bullet-list.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-bullet-list)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-bullet-list.svg)](https://npmcharts.com/compare/@tiptap/extension-bullet-list?minimal=true)

This extension enables you to use bullet lists in the editor. They are rendered as `<ul>` HTML tags.

Type <code>*&nbsp;</code>, <code>-&nbsp;</code> or <code>+&nbsp;</code> at the beginning of a new line and it will magically transform to a bullet list.

## Installation
```bash
npm install @tiptap/extension-bullet-list @tiptap/extension-list-item
```

This extension requires the [`ListItem`](/api/nodes/list-item) node.

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
BulletList.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### itemTypeName
Specify the list item name.

Default: `'listItem'`

```js
BulletList.configure({
  itemTypeName: 'listItem',
})
```
### keepMarks
Decides whether to keep the marks from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

```js
BulletList.configure({
  keepMarks: true,
})
```

### keepAttributes
Decides whether to keep the attributes from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

```js
BulletList.configure({
  keepAttributes: true,
})
```

## Commands

### toggleBulletList()
Toggles a bullet list.

```js
editor.commands.toggleBulletList()
```

## Keyboard shortcuts
| Command          | Windows/Linux                   | macOS                       |
| ---------------- | ------------------------------- | --------------------------- |
| toggleBulletList | `Control`&nbsp;`Shift`&nbsp;`8` | `Cmd`&nbsp;`Shift`&nbsp;`8` |

## Source code
[packages/extension-bullet-list/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bullet-list/)

## Usage
https://embed.tiptap.dev/preview/Nodes/BulletList
