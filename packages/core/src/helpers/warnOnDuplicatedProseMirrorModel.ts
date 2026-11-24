import type { Schema } from '@tiptap/pm/model'
import { Fragment } from '@tiptap/pm/model'
import { ReplaceStep } from '@tiptap/pm/transform'

import { isProseMirrorReplaceStep } from './isProseMirrorReplaceStep.js'

let hasChecked = false

/**
 * Warns once when prosemirror-model is loaded twice
 * @param schema The editor schema
 * @returns void
 * @example ```js
 * warnOnDuplicatedProseMirrorModel(editor.schema)
 * ```
 */
export function warnOnDuplicatedProseMirrorModel(schema: Schema): void {
  if (hasChecked) {
    return
  }

  hasChecked = true

  let content

  try {
    // Read the fragment from the model copy resolved by prosemirror-transform.
    const step = ReplaceStep.fromJSON(schema, { from: 0, to: 0 })

    if (!isProseMirrorReplaceStep(step)) {
      return
    }

    content = step.slice.content
  } catch {
    // A warning we cannot stand behind is worse than no warning.
    return
  }

  if (content instanceof Fragment) {
    return
  }

  console.warn(
    '[tiptap warn]: prosemirror-model is loaded more than once. Wrapping and splitting nodes will fail. Deduplicate it in your lock file, or alias it to a single copy in your bundler.',
  )
}
