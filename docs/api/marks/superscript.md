---
description: Write slightly above the normal line to show you’re just next level.
icon: superscript
---

# Superscript
[![Version](https://img.shields.io/npm/v/@tiptap/extension-superscript.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-superscript)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-superscript.svg)](https://npmcharts.com/compare/@tiptap/extension-superscript?minimal=true)

Use this extension to render text in <sup>superscript</sup>. If you pass `<sup>` or text with `vertical-align: super` as inline style in the editor’s initial content, both will be normalized to a `<sup>` HTML tag.

## Installation
```bash
npm install @tiptap/extension-superscript
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Superscript.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## Commands

### setSuperscript()
Mark text as superscript.

```js
editor.commands.setSuperscript()
```

### toggleSuperscript()
Toggle superscript mark.

```js
editor.commands.toggleSuperscript()
```

### unsetSuperscript()
Remove superscript mark.

```js
editor.commands.unsetSuperscript()
```

## Keyboard shortcuts
| Command             | Windows/Linux      | macOS          |
| ------------------- | ------------------ | -------------- |
| toggleSuperscript() | `Control`&nbsp;`.` | `Cmd`&nbsp;`.` |

## Source code
[packages/extension-superscript/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-superscript/)

## Usage
https://embed.tiptap.dev/preview/Marks/Superscript
