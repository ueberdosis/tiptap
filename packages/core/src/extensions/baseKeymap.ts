import {
  chainCommands,
  newlineInCode,
  createParagraphNear,
  liftEmptyBlock,
  splitBlockKeepMarks,
  exitCode,
  deleteSelection,
  joinForward,
  joinBackward,
  selectNodeForward,
  selectNodeBackward,
} from 'prosemirror-commands'
import { undoInputRule } from 'prosemirror-inputrules'
import { createExtension } from '../Extension'

export const BaseKeymap = createExtension({
  addKeyboardShortcuts() {
    const enter = chainCommands(
      newlineInCode,
      createParagraphNear,
      liftEmptyBlock,
      splitBlockKeepMarks,
    )

    const backspace = chainCommands(
      undoInputRule,
      deleteSelection,
      joinBackward,
      selectNodeBackward,
    )

    const del = chainCommands(
      deleteSelection,
      joinForward,
      selectNodeForward,
    )

    return {
      Enter: enter,
      'Mod-Enter': exitCode,
      Backspace: backspace,
      'Mod-Backspace': backspace,
      Delete: del,
      'Mod-Delete': del,
      // we don’t need a custom `selectAll` for now
      // 'Mod-a': () => this.editor.selectAll(),
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    BaseKeymap: typeof BaseKeymap,
  }
}
