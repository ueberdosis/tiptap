# Commands

## toc

## Introduction
The editor provides a ton of commands to programmtically add or change content or alter the selection. If you want to build your own editor you definitely want to learn more about them.

## Execute a command
All available commands are accessible through an editor instance. Let’s say you want to make text bold when a user clicks on a button. That’s how that would look like:

```js
editor.commands.setBold()
```

While that’s perfectly fine and does make the selected bold, you’d likely want to change multiple commands in one run. Let’s have a look at how that works.

### Chain commands
Most commands can be combined to one call. That’s shorter than separate function calls in most cases. Here is an example to make the selected text bold:

```js
editor
  .chain()
  .focus()
  .toggleBold()
  .run()
```

The `.chain()` is required to start a new chain and the `.run()` is needed to actually execute all the commands in between.

In the example above two different commands are executed at once. When a user clicks on a button outside of the content, the editor isn’t in focus anymore. That’s why you probably want to add a `.focus()` call to most of your commands. It brings back the focus to the editor, so the user can continue to type.

All chained commands are kind of queued up. They are combined to one single transaction. That means, the content is only updated once, also the `update` event is only triggered once.

#### Chaining inside custom commands
When chaining a command, the transaction is held back. If you want to chain commands inside your custom commands, you’ll need to use said transaction and add to it. Here is how you would do that:

```js
addCommands() {
  return {
    customCommand: attributes => ({ chain }) => {
      // Doesn’t work:
      // return editor.chain() …

      // Does work:
      return chain()
        .insertContent('foo!')
        .insertContent('bar!')
        .run()
    },
  }
}
```

### Inline commands
In some cases, it’s helpful to put some more logic in a command. That’s why you can execute commands in commands. I know, that sounds crazy, but let’s look at an example:

```js
editor
  .chain()
  .focus()
  .command(({ tr }) => {
    // manipulate the transaction
    tr.insertText('hey, that’s cool!')

    return true
  })
  .run()
```

### Dry run for commands
Sometimes, you don’t want to actually run the commands, but only know if it would be possible to run commands, for example to show or hide buttons in a menu. That’s what we added `.can()` for. Everything coming after this method will be executed, without applying the changes to the document:

```js
editor
  .can()
  .toggleBold()
```

And you can use it together with `.chain()`, too. Here is an example which checks if it’s possible to apply all the commands:

```js
editor
  .can()
  .chain()
  .toggleBold()
  .toggleItalic()
  .run()
```

Both calls would return `true` if it’s possible to apply the commands, and `false` in case it’s not.

In order to make that work with your custom commands, don’t forget to return `true` or `false`.

For some of your own commands, you probably want to work with the raw [transaction](/api/introduction). To make them work with `.can()` you should check if the transaction should be dispatched. Here is how you can create a simple `.insertText()` command:

```js
export default (value) => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.insertText(value)
  }

  return true
}
```

If you’re just wrapping another tiptap command, you don’t need to check that, we’ll do it for you.

```js
addCommands() {
  return {
    bold: () => ({ commands }) => {
      return commands.toggleMark('bold')
    },
  }
}
```

If you’re just wrapping a plain ProseMirror command, you’ll need to pass `dispatch` anyway. Then there’s also no need to check it:

```js
import { exitCode } from 'prosemirror-commands'

export default () => ({ state, dispatch }) => {
  return exitCode(state, dispatch)
}
```

### Try commands
If you want to run a list of commands, but want only the first successful command to be applied, you can do this with the `.first()` method. This method runs one command after the other and stops at the first which returns `true`.

For example, the backspace key tries to undo an input rule first. If that was successful, it stops there. If no input rule has been applied and thus can’t be reverted, it runs the next command and deletes the selection, if there is one. Here is the simplified example:

```js
editor.first(({ commands }) => [
  () => commands.undoInputRule(),
  () => commands.deleteSelection(),
  // …
])
```

Inside of commands you can do the same thing like that:

```js
export default () => ({ commands }) => {
  return commands.first([
    () => commands.undoInputRule(),
    () => commands.deleteSelection(),
    // …
  ])
}
```

## List of commands
Have a look at all of the core commands listed below. They should give you a good first impression of what’s possible.

### Content
| Command          | Description                                              | Links                                |
| ---------------- | -------------------------------------------------------- | ------------------------------------ |
| .clearContent()  | Clear the whole document.                                | [More](/api/commands/clear-content)  |
| .insertContent() | Insert a node or string of HTML at the current position. | [More](/api/commands/insert-content) |
| .setContent()    | Replace the whole document with new content.             | [More](/api/commands/set-content)    |

### Nodes & Marks
| Command                 | Description                                               | Links                                |
| ----------------------- | --------------------------------------------------------- | ------------------------------------ |
| .clearNodes()           | Normalize nodes to a simple paragraph.                    | [More](/api/commands/clear-nodes)  |
| .createParagraphNear()  | Create a paragraph nearby.                                | [More](/api/commands/create-paragraph-near)  |
| .extendMarkRange()      | Extends the text selection to the current mark.           | [More](/api/commands/extend-mark-range)  |
| .exitCode()             | Exit from a code block.                                   | [More](/api/commands/exit-code)  |
| .joinBackward()         | Join two nodes backward.                                  | [More](/api/commands/join-backward)  |
| .joinForward()          | Join two nodes forward.                                   | [More](/api/commands/join-forward)  |
| .lift()                 | Removes an existing wrap.                                 | [More](/api/commands/lift)  |
| .liftEmptyBlock()       | Lift block if empty.                                      | [More](/api/commands/lift-empty-block)  |
| .newlineInCode()        | Add a newline character in code.                          | [More](/api/commands/newline-in-code)  |
| .replace()              | Replaces text with a node.                                | [More](/api/commands/replace)  |
| .replaceRange()         | Replaces text with a node within a range.                 | [More](/api/commands/replace-range)  |
| .resetAttributes()      | Resets some node or mark attributes to the default value. | [More](/api/commands/reset-attributes)  |
| .setMark()              | Add a mark with new attributes.                           | [More](/api/commands/set-mark)  |
| .setNode()              | Replace a given range with a node.                        | [More](/api/commands/set-node)  |
| .splitBlock()           | Forks a new node from an existing node.                   | [More](/api/commands/split-block)  |
| .toggleMark()           | Toggle a mark on and off.                                 | [More](/api/commands/toggle-mark)  |
| .toggleNode()           | Toggle a node with another node.                          | [More](/api/commands/toggle-node)  |
| .toggleWrap()           | Wraps nodes in another node, or removes an existing wrap. | [More](/api/commands/toggle-wrap)  |
| .undoInputRule()        | Undo an input rule.                                       | [More](/api/commands/undo-input-rule)  |
| .unsetAllMarks()        | Remove all marks in the current selection.                | [More](/api/commands/unset-all-marks)  |
| .unsetMark()            | Remove a mark in the current selection.                   | [More](/api/commands/unset-mark)  |
| .updateAttributes()     | Update attributes of a node or mark.                      | [More](/api/commands/update-attributes)  |

### Lists
| Command          | Description                                 | Links                                |
| ---------------- | ------------------------------------------- | ------------------------------------ |
| .liftListItem()  | Lift the list item into a wrapping list.    | [More](/api/commands/lift-list-item)  |
| .sinkListItem()  | Sink the list item down into an inner list. | [More](/api/commands/sink-list-item)  |
| .splitListItem() | Splits one list item into two list items.   | [More](/api/commands/split-list-item)  |
| .toggleList()    | Toggle between different list types.        | [More](/api/commands/toggle-list)  |
| .wrapInList()    | Wrap a node in a list.                      | [More](/api/commands/wrap-in-list)  |

### Selection
| Command               | Description                             | Links                                |
| --------------------- | --------------------------------------- | ------------------------------------ |
| .blur()               | Removes focus from the editor.          | [More](/api/commands/blur)  |
| .deleteRange()        | Delete a given range.                   | [More](/api/commands/delete-range)  |
| .deleteSelection()    | Delete the selection, if there is one.  | [More](/api/commands/delete-selection)  |
| .enter()              | Trigger enter.                          | [More](/api/commands/enter)  |
| .focus()              | Focus the editor at the given position. | [More](/api/commands/focus)  |
| .keyboardShortcut()   | Trigger a keyboard shortcut.            | [More](/api/commands/keyboard-shortcut)  |
| .scrollIntoView()     | Scroll the selection into view.         | [More](/api/commands/scroll-into-view)  |
| .selectAll()          | Select the whole document.              | [More](/api/commands/select-all)  |
| .selectNodeBackward() | Select a node backward.                 | [More](/api/commands/select-node-backward)  |
| .selectNodeForward()  | Select a node forward.                  | [More](/api/commands/select-node-forward)  |
| .selectParentNode()   | Select the parent node.                 | [More](/api/commands/select-parent-node)  |

<!-- ## Example use cases

### Quote a text
TODO

Add a blockquote, with a specified text, add a paragraph below, set the cursor there.

```js
// Untested, work in progress, likely to change
this.editor
  .chain()
  .focus()
  .createParagraphNear()
  .insertContent(text)
  .setBlockquote()
  .insertContent('<p></p>')
  .createParagraphNear()
  .unsetBlockquote()
  .createParagraphNear()
  .insertContent('<p></p>')
  .run()
```

Add a custom command to insert a node.
```js
addCommands() {
  return {
    insertTimecode: attributes => ({ chain }) => {
      return chain()
        .focus()
        .insertContent({
          type: 'heading',
          attrs: {
            level: 2,
          },
          content: [
            {
              type: 'text',
              text: 'heading',
            },
          ],
        })
        .insertText(' ')
        .run();
    },
  }
},
```
-->

## Add custom commands
All extensions can add additional commands (and most do), check out the specific [documentation for the provided nodes](/api/nodes), [marks](/api/marks), and [extensions](/api/extensions) to learn more about those.

Of course, you can [add your custom extensions](/guide/custom-extensions) with custom commands aswell.

