# Commands

## toc

## Introduction
The editor provides a ton of commands to programmtically add or change content or alter the selection. If you want to build your own editor you definitely want to learn more about them.

## Execute a command
All available commands are accessible through an editor instance. Let’s say you want to make text bold when a user clicks on a button. That’s how that would look like:

```js
editor.bold()
```

While that’s perfectly fine and does make the selected bold, you’d likely want to change multiple commands in one run. Let’s have a look at how that works.

## Chain commands
Most commands can be executed combined to one call. First of all, that’s shorter than separate function call in most cases. Here is an example to make the selected text bold:

```js
editor.chain().focus().bold().run()
```

The `.chain()` is required to start a new chain and the `.run()` is needed to actually execute all the commands in between. Between those two functions, this example combines to different commands.

When a user clicks on a button outside of the content, the editor isn’t in focus anymore. That’s why you probably want to add a `.focus()` call to most of your commands, that brings back the focus to the editor and the user can continue to type.

All chained commands are kind of queued up. They are combined to one single transaction. That means, the content is only updated once, also the `update` event is only triggered once.

## Dry run for commands
Sometimes, you don’t want to actually run the commands, but only know if it would be possible to run commands, for example to show or hide buttons in a menu. Inside of a command you can *try* to execute other commands, without actually changing the content like this:

```js
commands.try([
  () => commands.splitBlock(),
  () => commands.whatever(),
])
```

Outside of components you can do this, too. The editor exposes a try method, which passes all commands and expects an array of commands you want to try:

```js
editor.try(({ commands }) => [
  () => commands.splitBlock(),
  () => commands.whatever(),
])
```

This stops at the first command which return `false`. Commands after that won’t be executed. Even if all commands would be possible to run, none of the changes are applied to the document.

## List of commands
Have a look at all of the core commands listed below. They should give you a good first impression of what’s possible.

### Content
| Command          | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| .clearContent()  | Clear the whole document.                                   |
| .insertgetHTML() | Insert a string of HTML at the currently selected position. |
| .insertText()    | Insert a string of text at the currently selected position. |
| .insertHTML()    |                                                             |
| .setContent()    | Replace the whole document with new content.                |

### Nodes & Marks
| Command                | Description                                |
| ---------------------- | ------------------------------------------ |
| .clearNodes()          |                                            |
| .removeMark()          |                                            |
| .removeMark()          | Remove a mark in the current selection.    |
| .removeMarks()         |                                            |
| .removeMarks()         | Remove all marks in the current selection. |
| .resetNodeAttributes() |                                            |
| .selectParentNode()    | Select the parent node.                    |
| .setBlockType()        | Replace a given range with a node.         |
| .setNodeAttributes()   |                                            |
| .splitBlock()          | Forks a new node from an existing node.    |
| .toggleBlockType()     | Toggle a node with another node.           |
| .toggleMark()          |                                            |
| .toggleMark()          | Toggle a mark on and off.                  |
| .toggleWrap()          |                                            |
| .updateMark()          |                                            |
| .updateMark()          | Update a mark with new attributes.         |

### Lists
| Command          | Description                                            |
| ---------------- | ------------------------------------------------------ |
| .liftListItem()  | Lift the list item into a wrapping list.               |
| .sinkListItem()  | Sink the list item down into an inner list.            |
| .splitListItem() | Splits a textblock of a list item into two list items. |
| .toggleList()    | Toggle between different list styles.                  |
| .wrapInList()    |                                                        |

### Selection
| Command            | Description                             |
| ------------------ | --------------------------------------- |
| .blur()            | Blurs the editor.                       |
| .deleteSelection() | Delete the selection, if there is one.  |
| .focus()           | Focus the editor at the given position. |
| .scrollIntoView()  | Scroll the selection into view.         |
| .selectAll()       | Select the whole document.              |

### Extensions
All extensions can add additional commands (and most do), check out the specific [documentation for the provided nodes](/api/nodes), [marks](/api/marks), and [extensions](/api/extensions) to learn more about those. Of course, you can [add your custom extensions](/guide/build-custom-extensions) with custom commands aswell.
