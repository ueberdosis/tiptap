# OrderedList
This extension enables you to use ordered lists in the editor. They are rendered as `<ol>` HTML tags,

Type <code>1.&nbsp;</code> (or any other number followed by a dot) at the beginning of a new line and it will magically transform to a ordered list.

## Installation
::: warning Use with ListItem
The `OrderedList` extension is intended to be used with the [`ListItem`](/api/extensions/list-item) extension. Make sure to import that one too, otherwise you’ll get a SyntaxError.
:::

```bash
# With npm
npm install @tiptap/extension-ordered-list @tiptap/extension-list-item

# Or: With Yarn
yarn add @tiptap/extension-ordered-list @tiptap/extension-list-item
```

## Settings
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
| Command      | Options | Description            |
| ------------ | ------- | ---------------------- |
| ordered_list | —       | Toggle a ordered list. |

## Keyboard shortcuts
* `Control`&nbsp;`Shift`&nbsp;`9`

## Source code
[packages/extension-ordered-list/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-ordered-list/)

## Usage
<demo name="Extensions/OrderedList" highlight="3-5,17-18,37-38" />
