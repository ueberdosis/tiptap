import { type EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import { type EditorView, Decoration, DecorationSet } from '@tiptap/pm/view'

import type { Editor } from './Editor'
import type { Extension } from './Extension'
import type { DecorationItem } from './types'

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

      props: {
        decorations: state => {
          return this.createDecorations(state, this.editor.view)
        },
      },
    })
  }

  createDecorations(state: EditorState, view: EditorView) {
    let items: DecorationItem[] = []

    this.extensions.forEach(extension => {
      if (!extension.config.decorations?.create) {
        return
      }

      const decos = extension.config.decorations.create({
        state,
        view,
      })

      if (!decos) {
        return
      }

      items = items ? [...items, ...decos] : decos
    })

    const decorations = items.map(item => {
      switch (item.type) {
        case 'node':
          return Decoration.node(item.from, item.to, item.attributes || {})
        case 'inline':
          return Decoration.inline(item.from, item.to, item.attributes || {})
        case 'widget':
          if (!item.widget) {
            throw new Error('Widget decoration requires a widget property')
          }

          return Decoration.widget(item.from, item.widget)
        default:
          throw new Error(`Unknown decoration type: ${item.type}`)
      }
    })

    return DecorationSet.create(state.doc, decorations)
  }
}
