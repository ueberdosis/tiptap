export interface ProsemirrorJSONMark {
  type: string
  attrs?: Record<string, unknown>
}

/** JSON node structure produced by the Yjs conversion helpers. */
export interface ProsemirrorJSONNode {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: ProsemirrorJSONMark[]
  content?: (ProsemirrorJSONNode | ProsemirrorJSONNode[])[]
}
