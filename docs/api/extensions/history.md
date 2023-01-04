---
description: If I could just go back and make everything undone … you can.
icon: history-line
---

# History
[![Version](https://img.shields.io/npm/v/@tiptap/extension-history.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-history)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-history.svg)](https://npmcharts.com/compare/@tiptap/extension-history?minimal=true)

This extension provides history support. All changes to the document will be tracked and can be removed with `undo`. Undone changes can be applied with `redo` again.

## Installation
```bash
npm install @tiptap/extension-history
```

:::warning Are you using Yarn, pNPM, npm 6 or less?
Unfortunately your package manager does not install peer dependencies automatically and you have to install them by your own. Please [see here](https://tiptap.dev/installation/peer-dependencies#tiptapextension-history) which packages are needed and how to install them.
:::

## Settings

### depth
The amount of history events that are collected before the oldest events are discarded. Defaults to 100.

Default: `100`

```js
History.configure({
  depth: 10,
})
```

### newGroupDelay
The delay between changes after which a new group should be started (in milliseconds). When changes aren’t adjacent, a new group is always started.

Default: `500`

```js
History.configure({
  newGroupDelay: 1000,
})
```

## Commands

### undo()
Undo the last change.

```js
editor.commands.undo()
```
### redo()
Redo the last change.

```js
editor.commands.redo()
```

## Keyboard shortcuts
| Command | Windows/Linux                                                                            | macOS                                                                        |
| ------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| undo()  | `Control`&nbsp;`Z`<br>`Control`&nbsp;`я`                                                 | `Cmd`&nbsp;`Z`<br>`Cmd`&nbsp;`я`                                             |
| redo()  | `Shift`&nbsp;`Control`&nbsp;`Z`<br>`Control`&nbsp;`Y`<br>`Shift`&nbsp;`Control`&nbsp;`я` | `Shift`&nbsp;`Cmd`&nbsp;`Z`<br>`Cmd`&nbsp;`Y`<br>`Shift`&nbsp;`Cmd`&nbsp;`я` |

## Source code
[packages/extension-history/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-history/)

## Usage
https://embed.tiptap.dev/preview/Extensions/History
