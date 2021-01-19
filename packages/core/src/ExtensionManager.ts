import { keymap } from 'prosemirror-keymap'
import { Schema, Node as ProsemirrorNode } from 'prosemirror-model'
import { inputRules } from 'prosemirror-inputrules'
import { EditorView, Decoration } from 'prosemirror-view'
import { Editor } from './Editor'
import { Extensions, NodeViewRenderer } from './types'
import getSchema from './helpers/getSchema'
import getSchemaTypeByName from './helpers/getSchemaTypeByName'
import getNodeType from './helpers/getNodeType'
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

      if (typeof extension.config.onCreate === 'function') {
        this.editor.on('create', extension.config.onCreate.bind(context))
      }

      if (typeof extension.config.onUpdate === 'function') {
        this.editor.on('update', extension.config.onUpdate.bind(context))
      }

      if (typeof extension.config.onSelection === 'function') {
        this.editor.on('selection', extension.config.onSelection.bind(context))
      }

      if (typeof extension.config.onTransaction === 'function') {
        this.editor.on('transaction', extension.config.onTransaction.bind(context))
      }

      if (typeof extension.config.onFocus === 'function') {
        this.editor.on('focus', extension.config.onFocus.bind(context))
      }

      if (typeof extension.config.onBlur === 'function') {
        this.editor.on('blur', extension.config.onBlur.bind(context))
      }

      if (typeof extension.config.onDestroy === 'function') {
        this.editor.on('destroy', extension.config.onDestroy.bind(context))
      }
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
          type: getNodeType(extension.config.name, this.schema),
        }
        const renderer = extension.config.addNodeView?.call(context) as NodeViewRenderer

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

  get textSerializers() {
    const { editor } = this
    const { nodeExtensions } = splitExtensions(this.extensions)

    return Object.fromEntries(nodeExtensions
      .filter(extension => !!extension.config.renderText)
      .map(extension => {
        const context = {
          options: extension.options,
          editor,
          type: getNodeType(extension.config.name, this.schema),
        }

        const textSerializer = (props: { node: ProsemirrorNode }) => extension.config.renderText?.call(context, props)

        return [extension.config.name, textSerializer]
      }))
  }

}
