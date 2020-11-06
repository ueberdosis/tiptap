# OrderedList
This extension enables you to use ordered lists in the editor. They are rendered as `<ol>` HTML tags.

Type <code>1.&nbsp;</code> (or any other number followed by a dot) at the beginning of a new line and it will magically transform to a ordered list.

## Installation
::: warning Use with ListItem
This extension requires the [`ListItem`](/api/nodes/list-item) node.
:::

```bash
# with npm
npm install @tiptap/extension-ordered-list @tiptap/extension-list-item

# with Yarn
yarn add @tiptap/extension-ordered-list @tiptap/extension-list-item
```

## Settings
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
| Command     | Parameters | Description             |
| ----------- | ---------- | ----------------------- |
| orderedList | —          | Toggle an ordered list. |

## Keyboard shortcuts
* `Control`&nbsp;`Shift`&nbsp;`9`

## Source code
[packages/extension-ordered-list/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-ordered-list/)

## Usage
<demo name="Nodes/OrderedList" highlight="3-5,17-18,37-38" />
