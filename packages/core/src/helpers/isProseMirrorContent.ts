import type { Fragment, Node as ProseMirrorNode } from '@tiptap/pm/model'

/**
 * Checks whether a value is already a ProseMirror node or fragment. Looks for the
 * `nodesBetween` method, because `instanceof` fails when prosemirror-model is loaded twice.
 * @param value Any value that could be passed as content
 * @returns True for a node or a fragment, false for JSON, HTML and everything else
 * @example ```js
 * isProseMirrorContent(editor.state.doc)
 * ```
 */
export function isProseMirrorContent(value: unknown): value is ProseMirrorNode | Fragment {
  return typeof (value as ProseMirrorNode | Fragment | undefined)?.nodesBetween === 'function'
}
