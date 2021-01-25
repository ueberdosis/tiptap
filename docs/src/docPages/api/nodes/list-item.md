# ListItem
[![Version](https://img.shields.io/npm/v/@tiptap/extension-list-item.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-list-item)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-list-item.svg)](https://npmcharts.com/compare/@tiptap/extension-list-item?minimal=true)

The ListItem extension adds support for the `<li>` HTML tag. It’s used for bullet lists and ordered lists and can’t really be used without them.

## Installation
::: warning Use with BulletList and/or OrderedList
This extension requires the [`BulletList`](/api/nodes/bullet-list) or [`OrderedList`](/api/nodes/ordered-list) node.
:::

```bash
# with npm
npm install @tiptap/extension-list-item

# with Yarn
yarn add @tiptap/extension-list-item
```

## Settings
| Option         | Type     | Default | Description                                                           |
| -------------- | -------- | ------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object` | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |

## Keyboard shortcuts
* New list item: `Enter`
* Sink a list item: `Tab`
* Lift a list item: `Shift`&nbsp;`Tab`

## Source code
[packages/extension-list-item/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-list-item/)

## Usage
<demo name="Nodes/ListItem" highlight="3-8,20-22,41-43" />
