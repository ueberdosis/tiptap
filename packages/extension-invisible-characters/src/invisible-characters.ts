import { Extension } from '@dibdab/core'

import { InvisibleCharactersPlugin, InvisibleCharactersPluginKey } from './plugin/index.js'
import { HardBreakNode } from './plugin/invisible-characters/hardBreak.js'
import { ParagraphNode } from './plugin/invisible-characters/paragraph.js'
import { SpaceCharacter } from './plugin/invisible-characters/space.js'
import type { InvisibleCharactersOptions } from './types.js'

export { HardBreakNode, ParagraphNode, SpaceCharacter }

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    invisibleCharacters: {
      /**
       * Show invisible characters
       */
      showInvisibleCharacters: (show?: boolean) => ReturnType

      /**
       * Hide invisible characters
       */
      hideInvisibleCharacters: () => ReturnType

      /**
       * Toggle invisible characters
       */
      toggleInvisibleCharacters: () => ReturnType
    }
  }
}

export const InvisibleCharacters = Extension.create<InvisibleCharactersOptions>({
  name: 'invisibleCharacters',

  addOptions() {
    return {
      visible: true,
      builders: [new SpaceCharacter(), new ParagraphNode(), new HardBreakNode()],
      injectCSS: true,
      injectNonce: undefined,
    }
  },

  addProseMirrorPlugins() {
    return [InvisibleCharactersPlugin(this.editor.state, this.options)]
  },

  addStorage() {
    return {
      visibility: () => this.options.visible,
    }
  },

  onBeforeCreate() {
    this.storage.visibility = () => {
      return InvisibleCharactersPluginKey.getState(this.editor.state)?.visible
    }
  },

  addCommands() {
    return {
      showInvisibleCharacters:
        (visibility = true) =>
        ({ dispatch, tr }) => {
          if (dispatch) {
            tr.setMeta('setInvisibleCharactersVisible', visibility)
          }

          return true
        },
      hideInvisibleCharacters:
        () =>
        ({ dispatch, tr }) => {
          if (dispatch) {
            tr.setMeta('setInvisibleCharactersVisible', false)
          }

          return true
        },
      toggleInvisibleCharacters:
        () =>
        ({ dispatch, tr, state }) => {
          const visibility = !InvisibleCharactersPluginKey.getState(state)?.visible

          if (dispatch) {
            tr.setMeta('setInvisibleCharactersVisible', visibility)
          }

          return true
        },
    }
  },
})

export default InvisibleCharacters
