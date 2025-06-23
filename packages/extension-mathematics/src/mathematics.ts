import { Extension } from '@tiptap/core'
import { EditorState } from '@tiptap/pm/state'

import { MathematicsPlugin } from './MathematicsPlugin.js'
import { MathematicsOptions } from './types.js'

export const defaultShouldRender = (state: EditorState, pos: number) => {
  const $pos = state.doc.resolve(pos)
  const isInCodeBlock = $pos.parent.type.name === 'codeBlock'

  return !isInCodeBlock
}

export const Mathematics = Extension.create<MathematicsOptions>({
  name: 'Mathematics',

  addOptions() {
    return {
      // eslint-disable-next-line no-useless-escape
      regex: /\$([^\$]*)\$/gi,
      katexOptions: undefined,
      shouldRender: defaultShouldRender,
    }
  },

  addProseMirrorPlugins() {
    return [MathematicsPlugin({ ...this.options, editor: this.editor })]
  },
})

export default Mathematics
