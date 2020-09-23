# History
This extension provides history support. All changes to the document will be tracked and can be removed with `undo`. Undone changes can be applied with `redo` again.

## Installation
```bash
# With npm
npm install @tiptap/extension-history

# Or: With Yarn
yarn add @tiptap/extension-history
```

## Options
*None*

## Commands
| Command | Options | Description           |
| ------- | ------- | --------------------- |
| undo    | —       | Undo the last change. |
| redo    | —       | Redo the last change. |

## Keyboard shortcuts
* Windows & Linux: `Control` + `Z`
* macOS: `Command` + `Z`

### Redo
* Windows & Linux: `Shift` + `Control` + `Z`
* macOS: `Shift` + `Command` + `Z`

## Source code
[packages/extension-history/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-history/)

## Usage
<demo name="Extensions/History" highlight="3-8,20,39" />