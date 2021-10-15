---
description: Write slightly below the normal line to show you’re unique.
icon: subscript
---

# Subscript
[![Version](https://img.shields.io/npm/v/@tiptap/extension-subscript.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-subscript)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-subscript.svg)](https://npmcharts.com/compare/@tiptap/extension-subscript?minimal=true)

Use this extension to render text in <sub>subscript</sub>. If you pass `<sub>` or text with `vertical-align: sub` as inline style in the editor’s initial content, both will be normalized to a `<sub>` HTML tag.

## Installation
```bash
# with npm
npm install @tiptap/extension-subscript

# with Yarn
yarn add @tiptap/extension-subscript
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Subscript.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## Commands

### setSubscript()
Mark text as subscript.

```js
editor.commands.setSubscript()
```

### toggleSubscript()
Toggle subscript mark.

```js
editor.commands.toggleSubscript()
```

### unsetSubscript()
Remove subscript mark.

```js
editor.commands.unsetSubscript()
```

## Keyboard shortcuts
| Command           | Windows/Linux      | macOS          |
| ----------------- | ------------------ | -------------- |
| toggleSubscript() | `Control`&nbsp;`,` | `Cmd`&nbsp;`,` |

## Source code
[packages/extension-subscript/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-subscript/)

## Usage
<tiptap-demo name="Marks/Subscript"></tiptap-demo>
