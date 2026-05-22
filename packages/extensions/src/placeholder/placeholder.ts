import { Extension, isNodeEmpty } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { Decoration } from '@tiptap/pm/view'
import { DecorationSet } from '@tiptap/pm/view'

import type { PlaceholderOptions } from './types.js'
import { createPlaceholderDecoration } from './utils/createPlaceholderDecoration.js'
import { findScrollParent } from './utils/findScrollParent.js'
import { getViewportBoundaryPositions } from './utils/getViewportBoundaryPositions.js'
import { throttle } from './utils/throttle.js'

/**
 * The default data attribute label
 */
const DEFAULT_DATA_ATTRIBUTE = 'placeholder'

/**
 * Prepares the placeholder attribute by ensuring it is properly formatted.
 * @param attr - The placeholder attribute string.
 * @returns The prepared placeholder attribute string.
 */
export function preparePlaceholderAttribute(attr: string): string {
  return (
    attr
      // replace whitespace with dashes
      .replace(/\s+/g, '-')
      // replace non-alphanumeric  characters
      // or special chars like $, %, &, etc.
      // but not dashes
      .replace(/[^a-zA-Z0-9-]/g, '')
      // and replace any numeric character at the start
      .replace(/^[0-9-]+/, '')
      // and finally replace any stray, leading dashes
      .replace(/^-+/, '')
      .toLowerCase()
  )
}

export const PLUGIN_KEY = new PluginKey('tiptap__placeholder')

/**
 * This extension allows you to add a placeholder to your editor.
 * A placeholder is a text that appears when the editor or a node is empty.
 * @see https://www.tiptap.dev/api/extensions/placeholder
 */
export const Placeholder = Extension.create<PlaceholderOptions>({
  name: 'placeholder',

  addOptions() {
    return {
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
      dataAttribute: DEFAULT_DATA_ATTRIBUTE,
      placeholder: 'Write something …',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: false,
    }
  },

  addProseMirrorPlugins() {
    const dataAttribute = this.options.dataAttribute
      ? `data-${preparePlaceholderAttribute(this.options.dataAttribute)}`
      : `data-${DEFAULT_DATA_ATTRIBUTE}`

    return [
      new Plugin({
        state: {
          init() {
            return {
              // null means "no viewport info yet" — decoration callback falls
              // back to full document scan until the scroll handler fires.
              topPos: null as number | null,
              bottomPos: null as number | null,
            }
          },
          apply(tr, prev) {
            const meta = tr.getMeta(PLUGIN_KEY) as { positions?: { top: number; bottom: number } } | undefined

            if (meta?.positions) {
              return {
                topPos: meta.positions.top,
                bottomPos: meta.positions.bottom,
              }
            }

            if (!tr.docChanged) {
              return prev
            }

            // Preserve last known viewport positions across transactions.
            // Without this, every keystroke resets back to a full document
            // scan, defeating the viewport optimisation.
            // Only map when we have actual positions — null means "no viewport
            // info yet" and should stay null to fall back to full doc scan.
            return {
              topPos: prev.topPos !== null ? tr.mapping.map(prev.topPos) : null,
              bottomPos: prev.bottomPos !== null ? tr.mapping.map(prev.bottomPos) : null,
            }
          },
        },
        key: PLUGIN_KEY,
        view(view) {
          const scrollContainer = findScrollParent(view.dom)

          const computeAndDispatch = () => {
            const positions = getViewportBoundaryPositions({
              view,
              doc: view.state.doc,
              scrollContainer,
            })

            const prev = PLUGIN_KEY.getState(view.state)
            if (prev.topPos === positions.top && prev.bottomPos === positions.bottom) {
              return
            }

            const tr = view.state.tr
              .setMeta(PLUGIN_KEY, { positions })
              // Flag this transaction so the update() method can detect
              // it and avoid re-entrant computation.
              .setMeta('tiptap__viewportUpdate', true)
            view.dispatch(tr)
          }

          const { call: throttledUpdate, cancel: cancelThrottle } = throttle(computeAndDispatch, 250)
          const scrollParent = scrollContainer

          scrollParent.addEventListener('scroll', throttledUpdate, { passive: true })

          // Fire once to populate initial viewport (bypass throttle)
          computeAndDispatch()

          return {
            update(_, prevState) {
              // Skip re-entry: the dispatch inside computeAndDispatch would
              // trigger this update again, but the doc didn't change so the
              // size guard catches that. The meta flag is an extra safeguard.
              if (view.state.doc.content.size !== prevState.doc.content.size) {
                computeAndDispatch()
              }
            },
            destroy: () => {
              cancelThrottle()
              scrollParent.removeEventListener('scroll', throttledUpdate)
            },
          }
        },
        props: {
          decorations: ({ doc, selection }) => {
            const active = this.editor.isEditable || !this.options.showOnlyWhenEditable

            if (!active) {
              return null
            }

            const { anchor } = selection
            const decorations: Decoration[] = []
            const isEmptyDoc = this.editor.isEmpty

            const useResolvedPath = this.options.showOnlyCurrent && !this.options.includeChildren

            if (useResolvedPath) {
              const resolved = doc.resolve(anchor)

              if (resolved.depth > 0) {
                const node = resolved.node(1)
                const nodeStart = resolved.before(1)

                if (node.type.isTextblock && isNodeEmpty(node)) {
                  const hasAnchor = anchor >= nodeStart && anchor <= nodeStart + node.nodeSize
                  const decoration = createPlaceholderDecoration({
                    node,
                    dataAttribute,
                    hasAnchor,
                    placeholder: this.options.placeholder,
                    classes: {
                      emptyEditor: this.options.emptyEditorClass,
                      emptyNode: this.options.emptyNodeClass,
                    },
                    editor: this.editor,
                    isEmptyDoc,
                    pos: resolved.before(1),
                  })

                  decorations.push(decoration)
                }
              }
            } else {
              const pluginState = PLUGIN_KEY.getState(this.editor.state)
              const from = pluginState.topPos ?? 0
              const to = pluginState.bottomPos ?? doc.content.size

              doc.nodesBetween(from, to, (node, pos) => {
                const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize
                const isEmpty = !node.isLeaf && isNodeEmpty(node)

                if (!node.type.isTextblock) {
                  return this.options.includeChildren
                }

                if ((hasAnchor || !this.options.showOnlyCurrent) && isEmpty) {
                  const decoration = createPlaceholderDecoration({
                    classes: { emptyEditor: this.options.emptyEditorClass, emptyNode: this.options.emptyNodeClass },
                    editor: this.editor,
                    isEmptyDoc,
                    dataAttribute,
                    hasAnchor,
                    placeholder: this.options.placeholder,
                    node,
                    pos,
                  })
                  decorations.push(decoration)
                }

                return this.options.includeChildren
              })
            }

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
