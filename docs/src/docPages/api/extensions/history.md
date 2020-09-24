# History
This extension provides history support. All changes to the document will be tracked and can be removed with `undo`. Undone changes can be applied with `redo` again.

## Installation
```bash
# With npm
npm install @tiptap/extension-history

# Or: With Yarn
yarn add @tiptap/extension-history
```

## Settings
| Option               | Type   | Default | Description                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------- | ------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| historyPluginOptions | Object | {}       | Supports the following configuration options:<br /><br />**depth:** The amount of history events that are collected before the oldest events are discarded. Defaults to 100.<br /><br />**newGroupDelay:** The delay between changes after which a new group should be started. Defaults to 500 (milliseconds). Note that when changes aren't adjacent, a new group is always started. |

## Commands
| Command | Options | Description           |
| ------- | ------- | --------------------- |
| undo    | —       | Undo the last change. |
| redo    | —       | Redo the last change. |

## Keyboard shortcuts
### Undo
* Windows/Linux: `Control` `Z`
* macOS: `Cmd` `Z`

### Redo
* Windows/Linux: `Shift` `Control` `Z`
* macOS: `Shift` `Cmd` `Z`

## Source code
[packages/extension-history/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-history/)

## Usage
<demo name="Extensions/History" highlight="3-8,20,39" />
