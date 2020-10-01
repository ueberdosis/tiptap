# Commands

## Table of Contents

## Introduction

## Chain commands

```js
editor.chain().focus().bold().run()
```

## List of commands

### Content
| Command         | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| .clearContent() | Clear the whole document.                                   |
| .insertHTML()   | Insert a string of HTML at the currently selected position. |
| .insertText()   | Insert a string of text at the currently selected position. |
| .setContent()   | Replace the whole document with new content.                |

### Nodes & Marks
| Command             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| .removeMark()       | Remove a mark in the current selection.                |
| .removeMarks()      | Remove all marks in the current selection.             |
| .selectParentNode() | Select the parent node.                                |
| .toggleMark()       | Toggle a mark on and off.                              |
| .toggleBlockType()  | Toggle a node with another node.                       |
| .setBlockType()     | Replace a given range with a node.                     |
| .updateMark()       | Update a mark with new attributes.                     |

### Lists
| Command             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| .liftListItem()     | Lift the list item into a wrapping list.               |
| .sinkListItem()     | Sink the list item down into an inner list.            |
| .splitListItem()    | Splits a textblock of a list item into two list items. |
| .toggleList()       | Toggle between different list styles.                  |

### Selection
| Command            | Description                             |
| ------------------ | --------------------------------------- |
| .blur()            | Blurs the editor.                       |
| .deleteSelection() | Delete the selection, if there is one.  |
| .focus()           | Focus the editor at the given position. |
| .scrollIntoView()  | Scroll the selection into view.         |
| .selectAll()       | Select the whole document.              |
