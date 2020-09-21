import { Node, nodeInputRule } from '@tiptap/core'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    horizontalRule(): Editor,
  }
}

export default new Node()
  .name('horizontalRule')
  .schema(() => ({
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM: () => ['hr'],
  }))
  // .commands(({ editor, type }) => ({
  //   horizontalRule: next => () => {
  //     const { state, view } = editor
  //     const { dispatch } = view

  //     dispatch(state.tr.replaceSelectionWith(type.create()))
  //     next()
  //   },
  // }))
  .inputRules(({ type }) => [
    nodeInputRule(/^(?:---|___\s|\*\*\*\s)$/, type),
  ])
  .create()
