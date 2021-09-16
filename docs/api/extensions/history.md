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
| Option        | Type     | Default | Description                                                                                                                                         |
| ------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| depth         | `Number` | `100`   | The amount of history events that are collected before the oldest events are discarded. Defaults to 100.                                            |
| newGroupDelay | `Number` | `500`   | The delay between changes after which a new group should be started (in milliseconds). When changes aren’t adjacent, a new group is always started. |

## Commands
| Command | Parameters | Description           |
| ------- | ---------- | --------------------- |
| undo    | —          | Undo the last change. |
| redo    | —          | Redo the last change. |

## Keyboard shortcuts
### Undo
* Windows/Linux: `Control`&nbsp;`Z`
* macOS: `Cmd`&nbsp;`Z`
#### Russian keyboard layouts
* Windows/Linux: `Control`&nbsp;`я`
* macOS: `Cmd`&nbsp;`я`

### Redo
* Windows/Linux: `Shift`&nbsp;`Control`&nbsp;`Z` or `Control`&nbsp;`Y`
* macOS: `Shift`&nbsp;`Cmd`&nbsp;`Z` or `Cmd`&nbsp;`Y`
#### Russian keyboard layouts
* Windows/Linux: `Shift`&nbsp;`Control`&nbsp;`я`
* macOS: `Shift`&nbsp;`Cmd`&nbsp;`я`

## Source code
[packages/extension-history/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-history/)

## Usage
<tiptap-demo name="Extensions/History"></tiptap-demo>
