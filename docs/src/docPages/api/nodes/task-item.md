# TaskItem
This extension renders a task item list element, which is a `<li>` tag with a `data-type` attribute set to `taskItem`. It also renders a checkbox inside the list element, which updates a `checked` attribute.

This extension doesn’t require any JavaScript framework, it’s based on plain JavaScript.

## Installation
::: warning Use with TaskList
This extension requires the [`TaskList`](/api/nodes/task-list) node.
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

## Keyboard shortcuts
* New list item: `Enter`

## Source code
[packages/extension-task-item/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-task-item/)

## Usage
<demo name="Nodes/TaskItem" />
