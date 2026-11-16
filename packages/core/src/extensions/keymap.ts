import type { EditorState } from '@tiptap/pm/state'
import { Plugin, PluginKey, Selection } from '@tiptap/pm/state'

import { CommandManager } from '../CommandManager.js'
import { Extension } from '../Extension.js'
import { createChainableState } from '../helpers/createChainableState.js'
import { isNodeEmpty } from '../helpers/isNodeEmpty.js'
import type { CommandProps } from '../types.js'
import { isiOS } from '../utilities/isiOS.js'
import { isMacOS } from '../utilities/isMacOS.js'

import { createAndroidDeletePlugin } from './createAndroidDeletePlugin.js'

/** Checks if a non-empty selection spans the whole document. */
function isWholeDocumentSelected(state: EditorState) {
  const { empty, from, to } = state.selection

  if (empty) {
    return false
  }

  return from === Selection.atStart(state.doc).from && to === Selection.atEnd(state.doc).to
}

function clearEmptyTextblock({ tr, commands }: CommandProps) {
  const { selection, doc } = tr
  const { empty, $anchor } = selection
  const { pos, parent } = $anchor

  if (!empty || !parent.isTextblock || parent.textContent.length) {
    return false
  }

  const $parentPos = pos > 0 ? doc.resolve(pos - 1) : $anchor
  const isOnlyIsolatedChild =
    $parentPos.parent.type.spec.isolating && $parentPos.parent.childCount === 1
  const isAtStart = isOnlyIsolatedChild
    ? pos === $anchor.start()
    : Selection.atStart(doc).from === pos

  if (!isAtStart || parent.type.name === 'paragraph') {
    return false
  }

  return commands.clearNodes()
}

export const Keymap = Extension.create({
  name: 'keymap',

  addKeyboardShortcuts() {
    const handleBackspace = () =>
      this.editor.commands.first(({ commands }) => [
        () => commands.undoInputRule(),

        () => commands.command(clearEmptyTextblock),

        () => commands.deleteSelection(),
        () => commands.joinBackward(),
        () => commands.selectNodeBackward(),
      ])

    const handleDelete = () =>
      this.editor.commands.first(({ commands }) => [
        () => commands.deleteSelection(),
        () => commands.deleteCurrentNode(),
        () => commands.joinForward(),
        () => commands.selectNodeForward(),
      ])

    const handleEnter = () =>
      this.editor.commands.first(({ commands }) => [
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
      createAndroidDeletePlugin(),
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new Plugin({
        key: new PluginKey('clearDocument'),
        appendTransaction: (transactions, oldState, newState) => {
          if (transactions.some(tr => tr.getMeta('composition'))) {
            return
          }

          const docChanges =
            transactions.some(transaction => transaction.docChanged) &&
            !oldState.doc.eq(newState.doc)

          const ignoreTr = transactions.some(transaction =>
            transaction.getMeta('preventClearDocument'),
          )

          if (!docChanges || ignoreTr) {
            return
          }

          if (!isWholeDocumentSelected(oldState)) {
            return
          }

          const isEmpty = isNodeEmpty(newState.doc)

          if (!isEmpty) {
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

          if (!tr.steps.length && !newState.storedMarks) {
            return
          }

          // Don't carry marks of the deleted text into the empty document
          return tr.setStoredMarks(null)
        },
      }),
    ]
  },
})
