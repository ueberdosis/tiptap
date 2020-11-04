import {
  newlineInCode,
  createParagraphNear,
  liftEmptyBlock,
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
    const handleBackspace = () => this.editor.try(({ state, dispatch }) => [
      () => undoInputRule(state, dispatch),
      () => deleteSelection(state, dispatch),
      () => joinBackward(state, dispatch),
      () => selectNodeBackward(state, dispatch),
    ])

    const handleDelete = () => this.editor.try(({ state, dispatch }) => [
      () => deleteSelection(state, dispatch),
      () => joinForward(state, dispatch),
      () => selectNodeForward(state, dispatch),
    ])

    return {
      Enter: () => this.editor.try(({ commands, state, dispatch }) => [
        () => newlineInCode(state, dispatch),
        () => createParagraphNear(state, dispatch),
        () => liftEmptyBlock(state, dispatch),
        () => commands.splitBlock(),
      ]),
      'Mod-Enter': exitCode,
      Backspace: () => handleBackspace(),
      'Mod-Backspace': () => handleBackspace(),
      Delete: () => handleDelete(),
      'Mod-Delete': () => handleDelete(),
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
