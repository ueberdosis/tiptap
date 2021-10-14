---
description: Quoting other people lets you look clever.
icon: double-quotes-l
---

# Blockquote
[![Version](https://img.shields.io/npm/v/@tiptap/extension-blockquote.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-blockquote)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-blockquote.svg)](https://npmcharts.com/compare/@tiptap/extension-blockquote?minimal=true)

The Blockquote extension enables you to use the `<blockquote>` HTML tag in the editor. This is great to … show quotes in the editor, you know?

Type <code>>&nbsp;</code> at the beginning of a new line and it will magically transform to a blockquote.

## Installation
```bash
# with npm
npm install @tiptap/extension-blockquote

# with Yarn
yarn add @tiptap/extension-blockquote
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Blockquote.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## Commands
### setBlockquote()
Wrap content in a blockquote.

```js
editor.commands.setBlockquote()
```

### toggleBlockquote()
Wrap or unwrap a blockquote.

```js
editor.commands.toggleBlockquote()
```

### unsetBlockquote()
Unwrap a blockquote.

```js
editor.commands.unsetBlockquote()
```

## Keyboard shortcuts
| Command           | Windows/Linux                   | macOS                       |
| ----------------- | ------------------------------- | --------------------------- |
| Toggle Blockquote | `Control`&nbsp;`Shift`&nbsp;`B` | `Cmd`&nbsp;`Shift`&nbsp;`B` |

## Source code
[packages/extension-blockquote/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-blockquote/)

## Usage
<tiptap-demo name="Nodes/Blockquote"></tiptap-demo>
