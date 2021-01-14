import { Extension } from '../Extension'

export const Keymap = Extension.create({
  name: 'keymap',

  addKeyboardShortcuts() {
    const handleBackspace = () => this.editor.commands.first(({ commands }) => [
      () => commands.undoInputRule(),
      () => commands.deleteSelection(),
      () => commands.joinBackward(),
      () => commands.selectNodeBackward(),
    ])

    const handleDelete = () => this.editor.commands.first(({ commands }) => [
      () => commands.deleteSelection(),
      () => commands.joinForward(),
      () => commands.selectNodeForward(),
    ])

    return {
      Enter: () => this.editor.commands.first(({ commands }) => [
        () => commands.newlineInCode(),
        () => commands.createParagraphNear(),
        () => commands.liftEmptyBlock(),
        () => commands.splitBlock(),
      ]),
      'Mod-Enter': () => this.editor.commands.exitCode(),
      Backspace: () => handleBackspace(),
      'Mod-Backspace': () => handleBackspace(),
      Delete: () => handleDelete(),
      'Mod-Delete': () => handleDelete(),
      // we don’t need a custom `selectAll` for now
      // 'Mod-a': () => this.editor.commands.selectAll(),
    }
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Keymap: typeof Keymap,
  }
}
