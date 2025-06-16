import { DecorationSet } from '@tiptap/pm/view'

import { InvisibleCharacter } from './plugin/InvisibleCharacter.js'
import { InvisibleNode } from './plugin/InvisibleNode.js'

export interface InvisibleCharactersOptions {
  visible: boolean,
  builders: Array<InvisibleCharacter | InvisibleNode>,
  injectCSS: boolean,
  injectNonce: string | undefined,
}

export interface Position {
  pos: number,
  text: string,
}

export interface PluginState {
  visible: boolean,
  decorations: DecorationSet,
}
