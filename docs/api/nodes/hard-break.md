---
description: Sometimes we all need a break, even if it’s just a line break.
icon: text-wrap
---

# HardBreak
[![Version](https://img.shields.io/npm/v/@tiptap/extension-hard-break.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-hard-break)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-hard-break.svg)](https://npmcharts.com/compare/@tiptap/extension-hard-break?minimal=true)

The HardBreak extensions adds support for the `<br>` HTML tag, which forces a line break.

## Installation
```bash
npm install @tiptap/extension-hard-break
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
HardBreak.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### keepMarks
Decides whether to keep marks after a line break. Based on the `keepOnSplit` option for marks.

Default: `true`

```js
HardBreak.configure({
  keepMarks: false,
})
```

## Commands

### setHardBreak()
Add a line break.

```js
editor.commands.setHardBreak()
```

## Keyboard shortcuts
| Command      | Windows/Linux                                  | macOS                                      |
| ------------ | ---------------------------------------------- | ------------------------------------------ |
| setHardBreak | `Shift`&nbsp;`Enter`<br>`Control`&nbsp;`Enter` | `Shift`&nbsp;`Enter`<br>`Cmd`&nbsp;`Enter` |

## Source code
[packages/extension-hard-break/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-hard-break/)

## Usage
https://embed.tiptap.dev/preview/Nodes/HardBreak
