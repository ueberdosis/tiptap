---
description: Helps to emphasize your text, doesn’t bring you closer to Italy though.
---

# Italic
[![Version](https://img.shields.io/npm/v/@tiptap/extension-italic.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-italic)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-italic.svg)](https://npmcharts.com/compare/@tiptap/extension-italic?minimal=true)

Use this extension to render text in *italic*. If you pass `<em>`, `<i>` tags, or text with inline `style` attributes setting `font-style: italic` in the editor’s initial content, they all will be rendered accordingly.

Type `*one asterisk*` or `_one underline_` and it will magically transform to *italic* text while you type.

::: warning Restrictions
The extension will generate the corresponding `<em>` HTML tags when reading contents of the `Editor` instance. All text marked italic, regardless of the method will be normalized to `<em>` HTML tags.
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-italic

# with Yarn
yarn add @tiptap/extension-italic
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Italic.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## Commands

### setItalic()
Mark the text italic.

```js
editor.commands.setItalic()
```

### toggleItalic()
Toggle the italic mark.

```js
editor.commands.toggleItalic()
```

### unsetItalic()
Remove the italic mark.

```js
editor.commands.unsetItalic()
```

## Keyboard shortcuts
| Command        | Windows/Linux      | macOS          |
| -------------- | ------------------ | -------------- |
| toggleItalic() | `Control`&nbsp;`I` | `Cmd`&nbsp;`I` |

## Source code
[packages/extension-italic/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-italic/)

## Usage
<tiptap-demo name="Marks/Italic"></tiptap-demo>
