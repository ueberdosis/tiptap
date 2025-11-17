import { type EditorState, type Transaction, Plugin, PluginKey } from '@tiptap/pm/state'
import { type EditorView, Decoration, DecorationSet } from '@tiptap/pm/view'

import type { Editor } from './Editor.js'
import type { DecorationItemWithExtension, DecorationOptions, Extensions } from './types.js'
import { findDecoUpdates } from './utilities/decorations.js'

export const decorationPluginKey = new PluginKey('__tiptap_decorations')

export class DecorationManager {
  editor: Editor

  extensions: Extensions

  decorationConfigs: Record<string, DecorationOptions> = {}

  constructor(props: { editor: Editor; extensions: Extensions }) {
    this.extensions = props.extensions
    this.editor = props.editor

    this.extensions.forEach(ext => {
      if (ext.config.decorations) {
        this.decorationConfigs[ext.name] = ext.config.decorations({ editor: this.editor })
      }
    })
  }

  createPlugin() {
    return new Plugin({
      key: decorationPluginKey,

      state: {
        init: () => {
          return this.createDecorations(this.editor.state, this.editor.view)
        },

        apply: (tr, decorationSet, oldState, newState) => {
          if (!this.needsRecreation(tr, oldState, newState)) {
            return decorationSet.map(tr.mapping, tr.doc)
          }

          const newDecorations = this.createDecorations(newState, this.editor.view)

          return findDecoUpdates(tr, decorationSet, newDecorations)
        },
      },

      props: {
        decorations(state) {
          return this.getState(state)
        },
      },
    })
  }

  createDecorations(state: EditorState, view: EditorView) {
    let items: DecorationItemWithExtension[] = []

    const extNames = Object.keys(this.decorationConfigs)

    extNames.forEach(name => {
      const config = this.decorationConfigs[name]

      const decos = config
        .create({
          state,
          view,
          editor: this.editor,
        })
        ?.map(item => ({
          ...item,
          extension: name,
        }))

      if (!decos) {
        return
      }

      items = items ? [...items, ...decos] : decos
    })

    const decorations = items.map(item => {
      switch (item.type) {
        case 'node':
          return Decoration.node(item.from, item.to, item.attributes || {}, {
            extension: item.extension,
            ...(item.spec || {}),
          })
        case 'inline':
          return Decoration.inline(item.from, item.to, item.attributes || {}, {
            extension: item.extension,
            ...(item.spec || {}),
          })
        case 'widget':
          if (!item.widget) {
            throw new Error('Widget decoration requires a widget property')
          }

          return Decoration.widget(item.from, item.widget, {
            extension: item.extension,
            // include a small key so that widget decorations are easier to diff
            key: `${item.extension}:${item.from}:${item.to}`,
            // merge any custom spec provided by the extension (e.g., dynamic display string)
            ...(item.spec || {}),
          })
        default:
          throw new Error(`Unknown decoration type: ${(item as any).type}`)
      }
    })

    return DecorationSet.create(state.doc, decorations)
  }

  needsRecreation(tr: Transaction, oldState: EditorState, newState: EditorState) {
    let needsRecreation = false

    const names = Object.keys(this.decorationConfigs)

    names.forEach(name => {
      const config = this.decorationConfigs[name]

      if (
        config.shouldUpdate &&
        config.shouldUpdate({
          tr,
          oldState,
          newState,
        })
      ) {
        needsRecreation = true
      }
    })

    return needsRecreation
  }
}
