# TaskList
[![Version](https://img.shields.io/npm/v/@tiptap/extension-task-list.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-task-list)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-task-list.svg)](https://npmcharts.com/compare/@tiptap/extension-task-list?minimal=true)

This extension enables you to use task lists in the editor. They are rendered as `<ul data-type="task_list">`. This implementation doesn’t require any framework, it’s using Vanilla JavaScript only.

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
| Option         | Type     | Default | Description                                                           |
| -------------- | -------- | ------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object` | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |

## Commands
| Command  | Parameters | Description         |
| -------- | ---------- | ------------------- |
| taskList | —          | Toggle a task list. |

## Keyboard shortcuts
* Windows/Linux: `Control`&nbsp;`Shift`&nbsp;`9`
* macOS: `Cmd`&nbsp;`Shift`&nbsp;`9`

## Source code
[packages/extension-task-list/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-task-list/)

## Usage
<demo name="Nodes/TaskList" highlight="3-5,17-18,37-38" />
