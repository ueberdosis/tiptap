---
description: The actually task, without it the task list would be nothing.
icon: task-line
---

# TaskItem
[![Version](https://img.shields.io/npm/v/@tiptap/extension-task-item.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-task-item)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-task-item.svg)](https://npmcharts.com/compare/@tiptap/extension-task-item?minimal=true)

This extension renders a task item list element, which is a `<li>` tag with a `data-type` attribute set to `taskItem`. It also renders a checkbox inside the list element, which updates a `checked` attribute.

This extension doesn’t require any JavaScript framework, it’s based on Vanilla JavaScript.

## Installation
```bash
# With npm
npm install @tiptap/extension-task-list @tiptap/extension-task-item

# Or: With Yarn
yarn add @tiptap/extension-task-list @tiptap/extension-task-item
```

This extension requires the [`TaskList`](/api/nodes/task-list) node.

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
TaskItem.configure({
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
[packages/extension-task-item/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-task-item/)

## Usage
https://embed.tiptap.dev/preview/Nodes/TaskItem
