import { Plugin, PluginKey, Selection } from 'prosemirror-state'

import { CommandManager } from '../CommandManager'
import { Extension } from '../Extension'
import { createChainableState } from '../helpers/createChainableState'
import { isiOS } from '../utilities/isiOS'
import { isMacOS } from '../utilities/isMacOS'

export const Keymap = Extension.create({
  name: 'keymap',

  addKeyboardShortcuts() {
    const handleBackspace = () => this.editor.commands.first(({ commands }) => [
      () => commands.undoInputRule(),
      // maybe convert first text block node to default node
      () => commands.command(({ tr }) => {
        const { selection, doc } = tr
        const { empty, $anchor } = selection
        const { pos, parent } = $anchor
        const isAtStart = Selection.atStart(doc).from === pos

        if (
          !empty
          || !isAtStart
          || !parent.type.isTextblock
          || parent.textContent.length
        ) {
          return false
        }

        return commands.clearNodes()
      }),
      () => commands.deleteSelection(),
      () => commands.joinBackward(),
      () => commands.selectNodeBackward(),
    ])

    const handleDelete = () => this.editor.commands.first(({ commands }) => [
      () => commands.deleteSelection(),
      () => commands.joinForward(),
      () => commands.selectNodeForward(),
    ])

    const handleEnter = () => this.editor.commands.first(({ commands }) => [
      () => commands.newlineInCode(),
      () => commands.createParagraphNear(),
      () => commands.liftEmptyBlock(),
      () => commands.splitBlock(),
    ])

    const baseKeymap = {
      Enter: handleEnter,
      'Mod-Enter': () => this.editor.commands.exitCode(),
      Backspace: handleBackspace,
      'Mod-Backspace': handleBackspace,
      'Shift-Backspace': handleBackspace,
      Delete: handleDelete,
      'Mod-Delete': handleDelete,
      'Mod-a': () => this.editor.commands.selectAll(),
    }

    const pcKeymap = {
      ...baseKeymap,
    }

    const macKeymap = {
      ...baseKeymap,
      'Ctrl-h': handleBackspace,
      'Alt-Backspace': handleBackspace,
      'Ctrl-d': handleDelete,
      'Ctrl-Alt-Backspace': handleDelete,
      'Alt-Delete': handleDelete,
      'Alt-d': handleDelete,
      'Ctrl-a': () => this.editor.commands.selectTextblockStart(),
      'Ctrl-e': () => this.editor.commands.selectTextblockEnd(),
    }

    if (isiOS() || isMacOS()) {
      return macKeymap
    }

    return pcKeymap
  },

  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new Plugin({
        key: new PluginKey('clearDocument'),
        appendTransaction: (transactions, oldState, newState) => {
          const docChanges = transactions.some(transaction => transaction.docChanged)
            && !oldState.doc.eq(newState.doc)

          if (!docChanges) {
            return
          }

          const { empty, from, to } = oldState.selection
          const allFrom = Selection.atStart(oldState.doc).from
          const allEnd = Selection.atEnd(oldState.doc).to
          const allWasSelected = from === allFrom && to === allEnd
          const isEmpty = newState.doc.textBetween(0, newState.doc.content.size, ' ', ' ').length === 0

          if (empty || !allWasSelected || !isEmpty) {
            return
          }

          const tr = newState.tr
          const state = createChainableState({
            state: newState,
            transaction: tr,
          })
          const { commands } = new CommandManager({
            editor: this.editor,
            state,
          })

          commands.clearNodes()

          if (!tr.steps.length) {
            return
          }

          return tr
        },
      }),
    ]
  },
})
