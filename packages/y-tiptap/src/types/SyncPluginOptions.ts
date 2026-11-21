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
  /**
   * Keeps shared content that does not fit the editor schema instead of deleting it.
   * While such content exists, the editor shows what it can, editing pauses and no changes are
   * written to the Yjs document. Called each time shared content stops fitting the schema.
   * @param error The schema error.
   * @example ySyncPlugin(fragment, { onInvalidContent: error => console.warn(error) })
   */
  onInvalidContent?: (error: Error) => void
}
