---
description: Structure the content with headings (comes with 6 different levels or less).
icon: h-1
---

# Heading
[![Version](https://img.shields.io/npm/v/@tiptap/extension-heading.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-heading)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-heading.svg)](https://npmcharts.com/compare/@tiptap/extension-heading?minimal=true)

The Heading extension adds support for headings of different levels. Headings are rendered with `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>` or `<h6>` HTML tags. By default all six heading levels (or styles) are enabled, but you can pass an array to only allow a few levels. Check the usage example to see how this is done.

Type <code>#&nbsp;</code> at the beginning of a new line and it will magically transform to a heading, same for <code>##&nbsp;</code>, <code>###&nbsp;</code>, <code>####&nbsp;</code>, <code>#####&nbsp;</code> and <code>######&nbsp;</code>.

## Installation
```bash
# with npm
npm install @tiptap/extension-heading

# with Yarn
yarn add @tiptap/extension-heading
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Heading.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### levels
Specifies which heading levels are supported.

Default: `[1, 2, 3, 4, 5, 6]`

```js
Heading.configure({
  levels: [1, 2],
})
```

## Commands

### setHeading()
Creates a heading node with the specified level.

```js
editor.commands.setHeading({ level: 1 })
```

### toggleHeading()
Toggles a heading node with the specified level.

```js
editor.commands.toggleHeading({ level: 1 })
```

## Keyboard shortcuts
| Command                     | Windows/Linux                 | macOS                     |
| --------------------------- | ----------------------------- | ------------------------- |
| toggleHeading({ level: 1 }) | `Control`&nbsp;`Alt`&nbsp;`1` | `Cmd`&nbsp;`Alt`&nbsp;`1` |
| toggleHeading({ level: 2 }) | `Control`&nbsp;`Alt`&nbsp;`2` | `Cmd`&nbsp;`Alt`&nbsp;`2` |
| toggleHeading({ level: 3 }) | `Control`&nbsp;`Alt`&nbsp;`3` | `Cmd`&nbsp;`Alt`&nbsp;`3` |
| toggleHeading({ level: 4 }) | `Control`&nbsp;`Alt`&nbsp;`4` | `Cmd`&nbsp;`Alt`&nbsp;`4` |
| toggleHeading({ level: 5 }) | `Control`&nbsp;`Alt`&nbsp;`5` | `Cmd`&nbsp;`Alt`&nbsp;`5` |
| toggleHeading({ level: 6 }) | `Control`&nbsp;`Alt`&nbsp;`6` | `Cmd`&nbsp;`Alt`&nbsp;`6` |

## Source code
[packages/extension-heading/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-heading/)

## Usage
https://embed.tiptap.dev/preview/Nodes/Heading
