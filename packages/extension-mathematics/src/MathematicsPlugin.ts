import { getChangedRanges } from '@tiptap/core'
import {
  EditorState, Plugin, PluginKey, Transaction,
} from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import katex from 'katex'

import { MathematicsOptionsWithEditor } from './types.js'

type DecoSpec = {
  isEditable: boolean;
  isEditing: boolean;
  katexOptions: MathematicsOptionsWithEditor['katexOptions'];
  content: string;
};

type Deco = Omit<Decoration, 'spec'> & { spec: DecoSpec };

type PluginState =
| { decorations: DecorationSet; isEditable: boolean }
| { decorations: undefined; isEditable: undefined }

/**
 * Get the range of positions that have been affected by a transaction
 */
function getAffectedRange(newState: EditorState, previousPluginState: PluginState, isEditable: boolean, tr: Transaction, state: EditorState) {
  const docSize = newState.doc.nodeSize - 2
  let minFrom = 0
  let maxTo = docSize

  if (previousPluginState.isEditable !== isEditable) {
    // When the editable state changes, run on all nodes just to be safe
    minFrom = 0
    maxTo = docSize
  } else if (tr.docChanged) {
    // When the document changes, only run on the nodes that have changed
    minFrom = docSize
    maxTo = 0

    getChangedRanges(tr).forEach(range => {
      // Purposefully over scan the range to ensure we catch all decorations
      minFrom = Math.min(minFrom, range.newRange.from - 1, range.oldRange.from - 1)
      maxTo = Math.max(maxTo, range.newRange.to + 1, range.oldRange.to + 1)
    })
  } else if (tr.selectionSet) {
    const { $from, $to } = state.selection
    const { $from: $newFrom, $to: $newTo } = newState.selection

    // When the selection changes, run on all the nodes between the old and new selection
    minFrom = Math.min(
      // Purposefully over scan the range to ensure we catch all decorations
      $from.depth === 0 ? 0 : $from.before(),
      $newFrom.depth === 0 ? 0 : $newFrom.before(),
    )
    maxTo = Math.max(
      $to.depth === 0 ? maxTo : $to.after(),
      $newTo.depth === 0 ? maxTo : $newTo.after(),
    )
  }

  return {
    minFrom: Math.max(minFrom, 0),
    maxTo: Math.min(maxTo, docSize),
  }
}

export const MathematicsPlugin = (options: MathematicsOptionsWithEditor) => {
  const {
    regex, katexOptions = {}, editor, shouldRender,
  } = options

  return new Plugin<PluginState>({
    key: new PluginKey('mathematics'),

    state: {
      init() {
        return { decorations: undefined, isEditable: undefined }
      },
      apply(tr, previousPluginState, state, newState) {

        if (!tr.docChanged && !tr.selectionSet && previousPluginState.decorations) {
          // Just reuse the existing decorations, since nothing should have changed
          return previousPluginState
        }

        const nextDecorationSet = (previousPluginState.decorations || DecorationSet.empty).map(
          tr.mapping,
          tr.doc,
        )
        const { selection } = newState
        const isEditable = editor.isEditable
        const decorationsToAdd = [] as Deco[]
        const { minFrom, maxTo } = getAffectedRange(newState, previousPluginState, isEditable, tr, state)

        newState.doc.nodesBetween(minFrom, maxTo, (node, pos) => {
          const enabled = shouldRender(newState, pos, node)

          if (node.isText && node.text && enabled) {
            let match: RegExpExecArray | null

            // eslint-disable-next-line no-cond-assign
            while ((match = regex.exec(node.text))) {
              const from = pos + match.index
              const to = from + match[0].length
              const content = match.slice(1).find(Boolean)

              if (content) {
                const selectionSize = selection.from - selection.to
                const anchorIsInside = selection.anchor >= from && selection.anchor <= to
                const rangeIsInside = selection.from >= from && selection.to <= to
                const isEditing = (selectionSize === 0 && anchorIsInside) || rangeIsInside

                if (
                  // Are the decorations already present?
                  nextDecorationSet.find(
                    from,
                    to,
                    (deco: DecoSpec) => isEditing === deco.isEditing
                      && content === deco.content
                      && isEditable === deco.isEditable
                      && katexOptions === deco.katexOptions,
                  ).length
                ) {
                  // Decoration exists in set, no need to add it again
                  continue
                }
                // Use an inline decoration to either hide original (preview is showing) or show it (editing "mode")
                decorationsToAdd.push(
                  Decoration.inline(
                    from,
                    to,
                    {
                      class:
                        isEditing && isEditable
                          ? 'Tiptap-mathematics-editor'
                          : 'Tiptap-mathematics-editor Tiptap-mathematics-editor--hidden',
                      style:
                        !isEditing || !isEditable
                          ? 'display: inline-block; height: 0; opacity: 0; overflow: hidden; position: absolute; width: 0;'
                          : undefined,
                    },
                    {
                      content,
                      isEditable,
                      isEditing,
                      katexOptions,
                    } satisfies DecoSpec,
                  ),
                )

                if (!isEditable || !isEditing) {
                  // Create decoration widget and add KaTeX preview if selection is not within the math-editor
                  decorationsToAdd.push(
                    Decoration.widget(
                      from,
                      () => {
                        const element = document.createElement('span')

                        // TODO: changeable class names
                        element.classList.add('Tiptap-mathematics-render')

                        if (isEditable) {
                          element.classList.add('Tiptap-mathematics-render--editable')
                        }

                        try {
                          katex.render(content!, element, katexOptions)
                        } catch {
                          element.innerHTML = content!
                        }

                        return element
                      },
                      {
                        content,
                        isEditable,
                        isEditing,
                        katexOptions,
                      } satisfies DecoSpec,
                    ),
                  )
                }
              }
            }
          }
        })

        // Remove any decorations that exist at the same position, they will be replaced by the new decorations
        const decorationsToRemove = decorationsToAdd.flatMap(deco => nextDecorationSet.find(deco.from, deco.to))

        return {
          decorations: nextDecorationSet
            // Remove existing decorations that are going to be replaced
            .remove(decorationsToRemove)
            // Add any new decorations
            .add(tr.doc, decorationsToAdd),
          isEditable,
        }
      },
    },

    props: {
      decorations(state) {
        return this.getState(state)?.decorations ?? DecorationSet.empty
      },
    },
  })
}
