import type { YType } from './YType.js'
import type { Node } from 'prosemirror-model'

/** Maps shared Yjs types to ProseMirror nodes or adjacent text nodes. */
export type ProsemirrorMapping = Map<YType, Node | Node[]>
