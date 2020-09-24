# ListItem
The ListItem extension adds support for the `<li>` HTML tag. It’s used for bullet lists and ordered lists and can’t really be used without them.

## Installation
::: warning Restrictions
This extensions is intended to be used with the [`BulletList`](/api/extensions/bullet-list) or [`OrderedList`](/api/extensions/ordered-list) extension. It doesn’t work without at least using one of them.
:::

```bash
# With npm
npm install @tiptap/extension-list-item

# Or: With Yarn
yarn add @tiptap/extension-list-item
```

## Settings
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
*None*

## Keyboard shortcuts
* New list item: `Enter`
* Sink a list item: `Tab`
* Lift a list item: `Shift ` `Tab`

## Source code
[packages/extension-list-item/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-list-item/)

## Usage
<demo name="Extensions/ListItem" highlight="3-8,20-22,41-43" />
