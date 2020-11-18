# BulletList
This extension enables you to use bullet lists in the editor. They are rendered as `<ul>` HTML tags.

Type <code>*&nbsp;</code>, <code>-&nbsp;</code> or <code>+&nbsp;</code> at the beginning of a new line and it will magically transform to a bullet list.

## Installation
::: warning Use with ListItem
This extension requires the [`ListItem`](/api/nodes/list-item) node.
:::

```bash
# with npm
npm install @tiptap/extension-bullet-list @tiptap/extension-list-item

# with Yarn
yarn add @tiptap/extension-bullet-list @tiptap/extension-list-item
```

## Settings
| Option         | Type     | Default | Description                                                           |
| -------------- | -------- | ------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object` | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |

## Commands
| Command    | Parameters | Description           |
| ---------- | ---------- | --------------------- |
| bulletList | —          | Toggle a bullet list. |

## Keyboard shortcuts
* `Control`&nbsp;`Shift`&nbsp;`8`

## Source code
[packages/extension-bullet-list/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-bullet-list/)

## Usage
<demo name="Nodes/BulletList" highlight="3-5,17-18,37-38" />
