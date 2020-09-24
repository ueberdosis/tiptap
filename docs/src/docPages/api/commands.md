# Commands

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
| Command             | Description                                |
| ------------------- | ------------------------------------------ |
| .removeMark()       | Remove a mark in the current selection.    |
| .removeMarks()      | Remove all marks in the current selection. |
| .replaceWithNode()  | Replace a given range with a node.         |
| .selectParentNode() | Select the parent node.                    |
| .toggleMark()       | Toggle a mark on and off.                  |
| .toggleNode()       | Toggle a node with another node.           |
| .updateMark()       | Update a mark with new attributes.         |

### Selection
| Command            | Description                             |
| ------------------ | --------------------------------------- |
| .deleteSelection() | Delete the selection, if there is one.  |
| .focus()           | Focus the editor at the given position. |
| .selectAll()       | Select the whole document.              |
