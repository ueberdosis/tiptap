import { PluginKey } from '@tiptap/pm/state'

import type { PlaceholderOptions } from './types.js'

export const placeholderSettingsPluginKey = new PluginKey<PlaceholderOptions['placeholder']>(
  'placeholderSettings',
)
