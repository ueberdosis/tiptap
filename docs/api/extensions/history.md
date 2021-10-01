# History
[![Version](https://img.shields.io/npm/v/@tiptap/extension-history.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-history)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-history.svg)](https://npmcharts.com/compare/@tiptap/extension-history?minimal=true)

This extension provides history support. All changes to the document will be tracked and can be removed with `undo`. Undone changes can be applied with `redo` again.

## Installation
```bash
# with npm
npm install @tiptap/extension-history

# with Yarn
yarn add @tiptap/extension-history
```

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
<tiptap-demo name="Extensions/History"></tiptap-demo>
