import type { PermanentUserData } from 'yjs'
import type { ColorDef } from './ColorDef.js'
import type { ProsemirrorMapping } from './ProsemirrorMapping.js'

/** Options for synchronizing a Yjs fragment with ProseMirror. */
export interface SyncPluginOptions {
  colors?: ColorDef[]
  colorMapping?: Map<string | null, ColorDef>
  permanentUserData?: PermanentUserData | null
  mapping?: ProsemirrorMapping
  onFirstRender?: () => void
}
