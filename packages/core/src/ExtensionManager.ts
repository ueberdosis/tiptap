import { keymap } from 'prosemirror-keymap'
import { Schema, Node as ProsemirrorNode } from 'prosemirror-model'
import { inputRules as inputRulesPlugin } from 'prosemirror-inputrules'
import { EditorView, Decoration } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'
import { Editor } from './Editor'
import { Extensions, NodeViewRenderer, RawCommands } from './types'
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

  get commands(): RawCommands {
    return this.extensions.reduce((commands, extension) => {
      const context = {
        options: extension.options,
        editor: this.editor,
        type: getSchemaTypeByName(extension.config.name, this.schema),
      }

      return {
        ...commands,
        ...extension.config.addCommands.bind(context)(),
      }
    }, {} as RawCommands)
  }

  get plugins(): Plugin[] {
    return [...this.extensions]
      .reverse()
      .map(extension => {
        const context = {
          options: extension.options,
          editor: this.editor,
          type: getSchemaTypeByName(extension.config.name, this.schema),
        }

        const keymapPlugin = keymap(extension.config.addKeyboardShortcuts.bind(context)())
        const inputRules = extension.config.addInputRules.bind(context)()
        const inputRulePlugins = this.editor.options.enableInputRules && inputRules.length
          ? [inputRulesPlugin({ rules: inputRules })]
          : []
        const pasteRulePlugins = this.editor.options.enablePasteRules
          ? extension.config.addPasteRules.bind(context)()
          : []
        const plugins = extension.config.addProseMirrorPlugins.bind(context)()

        return [
          keymapPlugin,
          ...inputRulePlugins,
          ...pasteRulePlugins,
          ...plugins,
        ]
      })
      .flat()
  }

  get attributes() {
    return getAttributesFromExtensions(this.extensions)
  }

  get nodeViews() {
    const { editor } = this
    const { nodeExtensions } = splitExtensions(this.extensions)

    return Object.fromEntries(nodeExtensions
      .filter(extension => !!extension.config.addNodeView)
      .map(extension => {
        const extensionAttributes = this.attributes.filter(attribute => attribute.type === extension.config.name)
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
