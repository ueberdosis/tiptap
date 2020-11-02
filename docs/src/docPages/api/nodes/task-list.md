# TaskList
This extension enables you to use task lists in the editor. They are rendered as `<ul>` HTML tags.

## Installation
::: warning Use with TaskItem
The `TaskList` extension is intended to be used with the [`TaskItem`](/api/extensions/task-item) extension. Make sure to import that one too, otherwise you’ll get a SyntaxError.
:::

```bash
# With npm
npm install @tiptap/extension-task-list @tiptap/extension-task-item

# Or: With Yarn
yarn add @tiptap/extension-task-list @tiptap/extension-task-item
```

## Settings
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
| Command  | Options | Description         |
| -------- | ------- | ------------------- |
| taskList | —       | Toggle a task list. |

## Source code
[packages/extension-task-list/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-task-list/)

## Usage
<demo name="Extensions/TaskList" />
