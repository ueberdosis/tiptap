import { type EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import { type EditorView, Decoration, DecorationSet } from '@tiptap/pm/view'

import type { Editor } from './Editor'
import type { Extension } from './Extension'

export const decorationPluginKey = new PluginKey('__tiptap_decorations')

export class DecorationManager {
  editor: Editor

  extensions: Extension[]

  constructor(props: { editor: Editor; extensions: Extension[] }) {
    this.extensions = props.extensions
    this.editor = props.editor
  }

  createPlugin() {
    return new Plugin({
      key: decorationPluginKey,

      state: {
        init: () => {
          return this.createDecorations(this.editor.state, this.editor.view)
        },
        apply: (tr, oldSet) => {
          const newSet = oldSet.map(tr.mapping, tr.doc)

          // If this transaction specifically requested decorations to be recalculated
          if (tr.getMeta(decorationPluginKey) === 'update') {
            return this.createDecorations(this.editor.state, this.editor.view)
          }

          return newSet
        },
      },

      props: {
        decorations: state => {
          return this.createDecorations(state, this.editor.view)
        },
      },
    })
  }

  createDecorations(state: EditorState, view: EditorView) {
    const decorations: Decoration[] = []

    this.extensions.forEach(extension => {
      if (!extension.config.decorations?.create) {
        return
      }

      const items = extension.config.decorations.create({
        state,
        view,
      })

      if (!items || !items.length) {
        return
      }

      items.forEach(item => {
        let decoration

        if (item.type === 'node') {
          decoration = Decoration.node(item.from, item.to, item.attributes || {})
        } else if (item.type === 'inline') {
          decoration = Decoration.inline(item.from, item.to, item.attributes || {})
        } else if (item.type === 'widget' && item.widget) {
          decoration = Decoration.widget(item.from, item.widget)
        }

        if (decoration) {
          decorations.push(decoration)
        }
      })
    })

    return DecorationSet.create(state.doc, decorations)
  }
}
