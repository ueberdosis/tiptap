---
description: Adds support for tasks (doesn’t make sure you actually complete them though).
icon: list-check
---

# TaskList
[![Version](https://img.shields.io/npm/v/@tiptap/extension-task-list.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-task-list)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-task-list.svg)](https://npmcharts.com/compare/@tiptap/extension-task-list?minimal=true)

This extension enables you to use task lists in the editor. They are rendered as `<ul data-type="taskList">`. This implementation doesn’t require any framework, it’s using Vanilla JavaScript only.

Type <code>[ ]&nbsp;</code> or <code>[x]&nbsp;</code> at the beginning of a new line and it will magically transform to a task list.

## Installation
```bash
# with npm
npm install @tiptap/extension-task-list @tiptap/extension-task-item

# with Yarn
yarn add @tiptap/extension-task-list @tiptap/extension-task-item
```

This extension requires the [`TaskItem`](/api/nodes/task-item) extension.

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
TaskList.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## Commands

# toggleTaskList()
Toggle a task list.

```js
editor.commands.toggleTaskList()
```

## Keyboard shortcuts
| Command          | Windows/Linux                   | macOS                       |
| ---------------- | ------------------------------- | --------------------------- |
| toggleTaskList() | `Control`&nbsp;`Shift`&nbsp;`9` | `Cmd`&nbsp;`Shift`&nbsp;`9` |

## Source code
[packages/extension-task-list/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-task-list/)

## Usage
https://embed.tiptap.dev/preview/Nodes/TaskList
