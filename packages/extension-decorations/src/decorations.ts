import { Extension } from '@tiptap/core'

import { DecorationsPlugin } from './plugin'
import { HardBreakDecorator } from './plugin/decorators/hardBreak'
import { ParagraphDecorator } from './plugin/decorators/paragraph'
import { SpaceDecorator } from './plugin/decorators/space'
import { DecorationsOptions } from './types'

export {
  HardBreakDecorator,
  ParagraphDecorator,
  SpaceDecorator,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    decorations: {
      /**
      * Show decorations
      */
      showDecorations?: () => ReturnType

      /**
      * hide decorations
      */
      hideDecorations?: () => ReturnType
    }
  }
}

export const Decorations = Extension.create<DecorationsOptions>({
  name: 'decorations',

  addOptions() {
    return {
      builders: [
        new SpaceDecorator(),
        new ParagraphDecorator(),
        new HardBreakDecorator(),
      ],
    }
  },

  addProseMirrorPlugins() {
    return [
      DecorationsPlugin(this.editor.state, this.options),
    ]
  },

  addCommands() {
    return {
      showDecorations: () => ({ editor, tr }) => {
        tr.setMeta('setDecorationsActive', true)
        editor.state.apply(tr)
        return true
      },
      hideDecorations: () => ({ editor, tr }) => {
        tr.setMeta('setDecorationsActive', false)
        editor.state.apply(tr)
        return true
      },
    }
  },
})
