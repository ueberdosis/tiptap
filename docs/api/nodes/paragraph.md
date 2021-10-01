# Paragraph
[![Version](https://img.shields.io/npm/v/@tiptap/extension-paragraph.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-paragraph)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-paragraph.svg)](https://npmcharts.com/compare/@tiptap/extension-paragraph?minimal=true)

Yes, the schema is very strict. Without this extension you won’t even be able to use paragraphs in the editor.

:::warning Breaking Change from 1.x → 2.x
tiptap 1 tried to hide that node from you, but it has always been there. You have to explicitly import it from now on (or use `StarterKit`).
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-paragraph

# with Yarn
yarn add @tiptap/extension-paragraph
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Paragraph.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## Commands

### setParagraph()
Transforms all selected nodes to paragraphs.

```js
editor.commands.setParagraph()
```

## Keyboard shortcuts
| Command        | Windows/Linux                 | macOS                     |
| -------------- | ----------------------------- | ------------------------- |
| setParagraph() | `Control`&nbsp;`Alt`&nbsp;`0` | `Cmd`&nbsp;`Alt`&nbsp;`0` |

## Source code
[packages/extension-paragraph/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-paragraph/)

## Usage
<tiptap-demo name="Nodes/Paragraph"></tiptap-demo>
