import { keymap } from 'prosemirror-keymap'
import { Schema, Node as ProsemirrorNode } from 'prosemirror-model'
import { inputRules } from 'prosemirror-inputrules'
import { EditorView, Decoration } from 'prosemirror-view'
import { Editor } from './Editor'
import { Extensions, NodeViewRenderer } from './types'
import getSchema from './helpers/getSchema'
import getSchemaTypeByName from './helpers/getSchemaTypeByName'
import splitExtensions from './helpers/splitExtensions'
import getAttributesFromExtensions from './helpers/getAttributesFromExtensions'
import getRenderedAttributes from './helpers/getRenderedAttributes'

export default class ExtensionManager {

  editor: Editor

  schema: Schema

  extensions: Extensions

  constructor(extensions: Extensions, editor: Editor) {
    this.editor = editor
    this.extensions = extensions
    this.schema = getSchema(this.extensions)

    this.extensions.forEach(extension => {
      const context = {
        options: extension.options,
        editor: this.editor,
        type: getSchemaTypeByName(extension.config.name, this.schema),
      }

      const commands = extension.config.addCommands.bind(context)()

      editor.registerCommands(commands)
    })
  }

  get plugins() {
    const plugins = this.extensions
      .map(extension => {
        const context = {
          options: extension.options,
          editor: this.editor,
          type: getSchemaTypeByName(extension.config.name, this.schema),
        }

        return extension.config.addProseMirrorPlugins.bind(context)()
      })
      .flat()

    return [
      ...plugins,
      ...this.keymaps,
      ...this.pasteRules,
      inputRules({ rules: this.inputRules }),
    ]
  }

  get inputRules() {
    if (!this.editor.options.enableInputRules) {
      return []
    }

    return this.extensions
      .map(extension => {
        const context = {
          options: extension.options,
          editor: this.editor,
          type: getSchemaTypeByName(extension.config.name, this.schema),
        }

        return extension.config.addInputRules.bind(context)()
      })
      .flat()
  }

  get pasteRules() {
    if (!this.editor.options.enablePasteRules) {
      return []
    }

    return this.extensions
      .map(extension => {
        const context = {
          options: extension.options,
          editor: this.editor,
          type: getSchemaTypeByName(extension.config.name, this.schema),
        }

        return extension.config.addPasteRules.bind(context)()
      })
      .flat()
  }

  get keymaps() {
    return this.extensions.map(extension => {
      const context = {
        options: extension.options,
        editor: this.editor,
        type: getSchemaTypeByName(extension.config.name, this.schema),
      }

      return keymap(extension.config.addKeyboardShortcuts.bind(context)())
    })
  }

  get nodeViews() {
    const { editor } = this
    const { nodeExtensions } = splitExtensions(this.extensions)
    const allAttributes = getAttributesFromExtensions(this.extensions)

    return Object.fromEntries(nodeExtensions
      .filter(extension => !!extension.config.addNodeView)
      .map(extension => {
        const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.config.name)
        const context = {
          options: extension.options,
          editor,
          type: getSchemaTypeByName(extension.config.name, this.schema),
        }

        // @ts-ignore
        const renderer = extension.config.addNodeView?.bind(context)?.() as NodeViewRenderer

        const nodeview = (
          node: ProsemirrorNode,
          view: EditorView,
          getPos: (() => number) | boolean,
          decorations: Decoration[],
        ) => {
          const HTMLAttributes = getRenderedAttributes(node, extensionAttributes)

          return renderer({
            editor,
            node,
            getPos,
            decorations,
            HTMLAttributes,
            extension,
          })
        }

        return [extension.config.name, nodeview]
      }))
  }

}
