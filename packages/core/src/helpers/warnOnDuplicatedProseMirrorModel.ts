import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Fragment } from '@tiptap/pm/model'
import { Transform } from '@tiptap/pm/transform'

let hasWarned = false

/**
 * Warns once when prosemirror-model is loaded more than once. ProseMirror then
 * rejects valid fragments with a `Can not convert <…> to a Fragment` error, and
 * wrapping or splitting nodes stops working.
 * @param doc A document created from the editor schema
 * @example warnOnDuplicatedProseMirrorModel(editor.state.doc)
 */
export function warnOnDuplicatedProseMirrorModel(doc: ProseMirrorNode): void {
  if (hasWarned) {
    return
  }

  try {
    // Replacing nothing with nothing, so only the fragment identity check can fail.
    new Transform(doc).replaceWith(0, 0, Fragment.empty)
  } catch {
    hasWarned = true

    console.warn(
      '[tiptap warn]: prosemirror-model is loaded more than once. Wrapping and splitting nodes will fail. Deduplicate it in your lock file, or alias it to a single copy in your bundler.',
    )
  }
}
