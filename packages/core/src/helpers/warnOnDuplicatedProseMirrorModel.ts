import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Fragment } from '@tiptap/pm/model'
import { Transform } from '@tiptap/pm/transform'

let hasChecked = false

/**
 * Warns once when prosemirror-model is loaded twice, which breaks wrapping and splitting nodes.
 * @param doc A document created from the editor schema
 * @returns Nothing, the warning goes to the console
 * @example ```js
 * warnOnDuplicatedProseMirrorModel(editor.state.doc)
 * ```
 */
export function warnOnDuplicatedProseMirrorModel(doc: ProseMirrorNode): void {
  if (hasChecked) {
    return
  }

  hasChecked = true

  try {
    // Replacing nothing with nothing, so only the fragment identity check can fail.
    new Transform(doc).replaceWith(0, 0, Fragment.empty)
  } catch (error) {
    // Anything else is not ours to report, a probe must never break the editor.
    if (error instanceof RangeError && error.message.includes('prosemirror-model')) {
      console.warn(
        '[tiptap warn]: prosemirror-model is loaded more than once. Wrapping and splitting nodes will fail. Deduplicate it in your lock file, or alias it to a single copy in your bundler.',
      )
    }
  }
}
