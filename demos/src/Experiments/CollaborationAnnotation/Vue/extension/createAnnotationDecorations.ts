import type { EditorState } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { ResolvedAnnotation } from './types/Annotation.js'

export function createAnnotationDecorations(state: EditorState, annotations: ResolvedAnnotation[]) {
  const decorations: Decoration[] = []

  annotations.forEach(annotation => {
    if (annotation.from === null || annotation.to === null) {
      return
    }

    const attributes = {
      class: 'annotation',
      'data-annotation-id': annotation.id,
      title: annotation.text,
    }
    decorations.push(
      annotation.kind === 'node'
        ? Decoration.node(annotation.from, annotation.to, attributes)
        : Decoration.inline(annotation.from, annotation.to, attributes),
    )
  })

  return DecorationSet.create(state.doc, decorations)
}
