import type { Fragment, Node as ProseMirrorNode } from '@tiptap/pm/model'

/**
 * Checks whether a node or fragment is a fragment. Looks for a missing `type` field,
 * because `instanceof` fails when prosemirror-model is loaded twice.
 * @param nodeOrFragment A ProseMirror node or fragment
 * @returns True for a fragment, false for a node
 * @example ```js
 * isFragment(editor.state.doc.content)
 * ```
 */
export function isFragment(nodeOrFragment: ProseMirrorNode | Fragment): nodeOrFragment is Fragment {
  return !('type' in nodeOrFragment)
}
