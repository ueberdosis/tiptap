---
description: Add a line below your text to make it look more … underlined.
icon: underline
---

# Underline
[![Version](https://img.shields.io/npm/v/@tiptap/extension-underline.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-underline)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-underline.svg)](https://npmcharts.com/compare/@tiptap/extension-underline?minimal=true)

Use this extension to render text <u>underlined</u>. If you pass `<u>` tags, or text with inline `style` attributes setting `text-decoration: underline` in the editor’s initial content, they all will be rendered accordingly.

Be aware that underlined text in the Internet usually indicates that it’s a clickable link. Don’t confuse your users with underlined text.

::: warning Restrictions
The extension will generate the corresponding `<u>` HTML tags when reading contents of the `Editor` instance. All text marked underlined, regardless of the method will be normalized to `<u>` HTML tags.
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-underline

# with Yarn
yarn add @tiptap/extension-underline
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Underline.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## Commands

### setUnderline()
Marks a text as underlined.

```js
editor.commands.setUnderline()
```

### toggleUnderline()
Toggles an underline mark.

```js
editor.commands.toggleUnderline()
```

### unsetUnderline()
Removes an underline mark.

```js
editor.commands.unsetUnderline()
```

## Keyboard shortcuts
| Command           | Windows/Linux      | macOS          |
| ----------------- | ------------------ | -------------- |
| toggleUnderline() | `Control`&nbsp;`U` | `Cmd`&nbsp;`U` |

## Source code
[packages/extension-underline/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-underline/)

## Usage
<tiptap-demo name="Marks/Underline"></tiptap-demo>
