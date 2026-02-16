import type { DecorationSet } from '@tiptap/pm/view'

import type { InvisibleCharacter } from './plugin/InvisibleCharacter.js'
import type { InvisibleNode } from './plugin/InvisibleNode.js'

export interface InvisibleCharactersOptions {
  visible: boolean
  builders: Array<InvisibleCharacter | InvisibleNode>
  injectCSS: boolean
  injectNonce: string | undefined
}

export interface Position {
  pos: number
  text: string
}

export interface PluginState {
  visible: boolean
  decorations: DecorationSet
}

export interface InvisibleCharactersStorage {
  /**
   * Get whether the invisible characters are shown or not
   */
  visibility: () => boolean
}

declare module '@tiptap/core' {
  interface Storage {
    invisibleCharacters: InvisibleCharactersStorage
  }
}
