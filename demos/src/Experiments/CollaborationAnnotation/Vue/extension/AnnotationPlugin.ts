import { Plugin, PluginKey } from '@tiptap/pm/state'
import { DecorationSet } from '@tiptap/pm/view'
import type { Transaction } from 'yjs'
import type { AnnotationPluginOptions } from './types/Annotation.js'
import { createAnnotationDecorations } from './createAnnotationDecorations.js'
import { resolveAnnotations } from './resolveAnnotations.js'

const AnnotationPluginKey = new PluginKey<DecorationSet>('annotation')

export const AnnotationPlugin = (options: AnnotationPluginOptions) =>
  new Plugin<DecorationSet>({
    key: AnnotationPluginKey,

    state: {
      init: () => DecorationSet.empty,
      apply(transaction, decorations, _oldState, state) {
        if (transaction.getMeta(AnnotationPluginKey)) {
          return createAnnotationDecorations(state, resolveAnnotations(state, options.map))
        }

        return decorations.map(transaction.mapping, transaction.doc)
      },
    },

    props: {
      decorations: state => AnnotationPluginKey.getState(state),
    },

    view(view) {
      let queued = false
      let destroyed = false
      const refresh = () => {
        if (queued) {
          return
        }

        queued = true
        // Resolve after the binding has synchronized XML and identity transfers.
        queueMicrotask(() => {
          queued = false

          if (destroyed) {
            return
          }

          view.dispatch(view.state.tr.setMeta(AnnotationPluginKey, true))
          options.onUpdate(resolveAnnotations(view.state, options.map))
        })
      }

      const onChange = (transaction: Transaction) => {
        if (transaction.changed.size > 0) {
          refresh()
        }
      }

      options.document.on('afterTransaction', onChange)
      refresh()

      return {
        destroy() {
          destroyed = true
          options.document.off('afterTransaction', onChange)
        },
      }
    },
  })
