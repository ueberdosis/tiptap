import type { DecorationSet } from '@tiptap/pm/view'

import type { InvisibleCharacter } from './plugin/InvisibleCharacter.js'
import type { InvisibleNode } from './plugin/InvisibleNode.js'

/**
 * Options for the `InvisibleCharacters` extension.
 */
export interface InvisibleCharactersOptions {
  /**
   * Whether the characters are shown from the start.
   * @default true
   */
  visible: boolean

  /**
   * Which characters to show. Add your own to mark more of them.
   */
  builders: Array<InvisibleCharacter | InvisibleNode>

  /**
   * Whether the default styles are injected.
   * @default true
   */
  injectCSS: boolean

  /**
   * A nonce for the injected style tag, needed for strict CSP setups.
   * @default undefined
   */
  injectNonce: string | undefined
}

/**
 * A spot in the document where an invisible character is drawn.
 */
export interface Position {
  pos: number

  /**
   * The text at that spot, used to pick the right marker.
   */
  text: string
}

/**
 * Whether the characters are shown, and the markers currently drawn.
 */
export interface PluginState {
  visible: boolean
  decorations: DecorationSet
}

/**
 * What the extension keeps on `editor.storage.invisibleCharacters`.
 */
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
