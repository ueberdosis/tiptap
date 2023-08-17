---
description: Add extra keymap handlers to change the default backspace and delete behavior for lists.
icon: asterisk
---

# ListKeymap
[![Version](https://img.shields.io/npm/v/@tiptap/extension-list-keymap.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-list-keymap)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-list-keymap.svg)](https://npmcharts.com/compare/@tiptap/extension-list-keymap?minimal=true)

This extensions adds extra keymap handlers to change the default backspace and delete behavior for lists. Those are not included in the core package, because they are not required for the most basic use cases.

## Installation
```bash
npm install @tiptap/extension-list-keymap
```

## Settings

### listTypes
A array of list items and their parent wrapper node types.

Default:

```js
[
  {
    itemName: 'listItem',
    wrapperNames: ['bulletList', 'orderedList'],
  },
  {
    itemName: 'taskItem',
    wrapperNames: ['taskList'],
  },
]
```

```js
ListKeymap.configure({
  listTypes: [
    {
      itemName: 'taskItem',
      wrapperNames: ['customTaskList'],
    },
  ],
})
```

## Source code
[packages/extension-list-keymap/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-list-keymap/)

## Usage
https://embed.tiptap.dev/preview/Extensions/ListKeymap
