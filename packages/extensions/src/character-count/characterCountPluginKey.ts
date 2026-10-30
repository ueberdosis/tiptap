import { PluginKey } from '@tiptap/pm/state'

import type { CharacterCountOptions } from './character-count.js'

export const characterCountPluginKey = new PluginKey<{
  limit: CharacterCountOptions['limit']
  initialized: boolean
}>('characterCount')
