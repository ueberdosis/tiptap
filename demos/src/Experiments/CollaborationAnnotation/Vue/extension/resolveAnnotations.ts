import type { EditorState } from '@tiptap/pm/state'
import { relativePositionToAbsolutePosition, ySyncPluginKey } from '@tiptap/y-tiptap'
import * as Y from 'yjs'
import type { Annotation, AnnotationRange, ResolvedAnnotation } from './types/Annotation.js'

export function resolveAnnotations(state: EditorState, map: Y.Map<Annotation>) {
  const sync = ySyncPluginKey.getState(state)
  const annotations: ResolvedAnnotation[] = []

  if (!sync) {
    return annotations
  }

  const resolve = (encoded: number[]) =>
    relativePositionToAbsolutePosition(
      sync.doc,
      sync.type,
      Y.decodeRelativePosition(Uint8Array.from(encoded)),
      sync.binding.mapping,
    )

  map.forEach((annotation, id) => {
    const range = getAnnotationRange(state, annotation, resolve)
    annotations.push({ id, kind: annotation.kind, text: annotation.text, ...range })
  })

  return annotations
}

function getAnnotationRange(
  state: EditorState,
  annotation: Annotation,
  resolve: (encoded: number[]) => number | null,
): AnnotationRange {
  if (annotation.kind === 'node') {
    return getNodeRange(state, annotation, resolve(annotation.anchor))
  }

  const from = resolve(annotation.from)
  const to = resolve(annotation.to)
  return isValidRange(from, to, state.doc.content.size)
    ? { from: from!, to: to! }
    : { from: null, to: null }
}

const isValidRange = (from: number | null, to: number | null, size: number) =>
  from !== null && to !== null && from < to && to <= size

function getNodeRange(
  state: EditorState,
  annotation: Extract<Annotation, { kind: 'node' }>,
  from: number | null,
): AnnotationRange {
  if (from === null) {
    return { from: null, to: null }
  }

  const node = state.doc.nodeAt(from)

  if (!node) {
    return { from: null, to: null }
  }

  return node.type.name === annotation.nodeType
    ? { from, to: from + node.nodeSize }
    : { from: null, to: null }
}
