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
import callOrReturn from './utilities/callOrReturn'

export default class ExtensionManager {

  editor: Editor

  schema: Schema

  extensions: Extensions

  splittableMarks: string[] = []

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

      if (extension.type === 'mark') {
        const keepOnSplit = callOrReturn(extension.config.keepOnSplit, context) ?? true

        if (keepOnSplit) {
          this.splittableMarks.push(extension.config.name)
        }
      }

      if (typeof extension.config.onBeforeCreate === 'function') {
        this.editor.on('beforeCreate', extension.config.onBeforeCreate.bind(context))
      }

      if (typeof extension.config.onCreate === 'function') {
        this.editor.on('create', extension.config.onCreate.bind(context))
      }

      if (typeof extension.config.onUpdate === 'function') {
        this.editor.on('update', extension.config.onUpdate.bind(context))
      }

      if (typeof extension.config.onSelectionUpdate === 'function') {
        this.editor.on('selectionUpdate', extension.config.onSelectionUpdate.bind(context))
      }

      if (typeof extension.config.onViewUpdate === 'function') {
        this.editor.on('viewUpdate', extension.config.onViewUpdate.bind(context))
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

      if (!extension.config.addCommands) {
        return commands
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

        const plugins: Plugin[] = []

        if (extension.config.addKeyboardShortcuts) {
          const keyMapPlugin = keymap(extension.config.addKeyboardShortcuts.bind(context)())

          plugins.push(keyMapPlugin)
        }

        if (this.editor.options.enableInputRules && extension.config.addInputRules) {
          const inputRules = extension.config.addInputRules.bind(context)()
          const inputRulePlugins = inputRules.length
            ? [inputRulesPlugin({ rules: inputRules })]
            : []

          plugins.push(...inputRulePlugins)
        }

        if (this.editor.options.enablePasteRules && extension.config.addPasteRules) {
          const pasteRulePlugins = extension.config.addPasteRules.bind(context)()

          plugins.push(...pasteRulePlugins)
        }

        if (extension.config.addProseMirrorPlugins) {
          const proseMirrorPlugins = extension.config.addProseMirrorPlugins.bind(context)()

          plugins.push(...proseMirrorPlugins)
        }

        return plugins
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
