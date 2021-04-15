import { keymap } from 'prosemirror-keymap'
import { Schema, Node as ProsemirrorNode } from 'prosemirror-model'
import { inputRules as inputRulesPlugin } from 'prosemirror-inputrules'
import { EditorView, Decoration } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'
import { Editor } from './Editor'
import { Extensions, RawCommands, AnyConfig } from './types'
import getExtensionField from './helpers/getExtensionField'
import getSchema from './helpers/getSchema'
import getSchemaTypeByName from './helpers/getSchemaTypeByName'
import getNodeType from './helpers/getNodeType'
import splitExtensions from './helpers/splitExtensions'
import getAttributesFromExtensions from './helpers/getAttributesFromExtensions'
import getRenderedAttributes from './helpers/getRenderedAttributes'
import callOrReturn from './utilities/callOrReturn'
import { NodeConfig } from '.'

export default class ExtensionManager {

  editor: Editor

  schema: Schema

  extensions: Extensions

  splittableMarks: string[] = []

  constructor(extensions: Extensions, editor: Editor) {
    this.editor = editor
    this.extensions = this.sort(extensions)
    this.schema = getSchema(this.extensions)

    this.extensions.forEach(extension => {
      const context = {
        options: extension.options,
        editor: this.editor,
        type: getSchemaTypeByName(extension.config.name, this.schema),
      }

      if (extension.type === 'mark') {
        const keepOnSplit = callOrReturn(getExtensionField(extension, 'keepOnSplit', context)) ?? true

        if (keepOnSplit) {
          this.splittableMarks.push(extension.config.name)
        }
      }

      // if (typeof extension.config.onBeforeCreate === 'function') {
      //   this.editor.on('beforeCreate', extension.config.onBeforeCreate.bind(context))
      // }

      // if (typeof extension.config.onCreate === 'function') {
      //   this.editor.on('create', extension.config.onCreate.bind(context))
      // }

      // if (typeof extension.config.onUpdate === 'function') {
      //   this.editor.on('update', extension.config.onUpdate.bind(context))
      // }

      // if (typeof extension.config.onSelectionUpdate === 'function') {
      //   this.editor.on('selectionUpdate', extension.config.onSelectionUpdate.bind(context))
      // }

      // if (typeof extension.config.onTransaction === 'function') {
      //   this.editor.on('transaction', extension.config.onTransaction.bind(context))
      // }

      // if (typeof extension.config.onFocus === 'function') {
      //   this.editor.on('focus', extension.config.onFocus.bind(context))
      // }

      // if (typeof extension.config.onBlur === 'function') {
      //   this.editor.on('blur', extension.config.onBlur.bind(context))
      // }

      // if (typeof extension.config.onDestroy === 'function') {
      //   this.editor.on('destroy', extension.config.onDestroy.bind(context))
      // }
    })
  }

  private sort(extensions: Extensions) {
    const defaultPriority = 100

    return extensions.sort((a, b) => {
      if ((a.config.priority || defaultPriority) > (b.config.priority || defaultPriority)) {
        return -1
      }

      if ((a.config.priority || defaultPriority) < (b.config.priority || defaultPriority)) {
        return 1
      }

      return 0
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
        ...getExtensionField(extension, 'addCommands', context)(),
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

        const addKeyboardShortcuts = getExtensionField<AnyConfig['addKeyboardShortcuts']>(
          extension,
          'addKeyboardShortcuts',
          context,
        )

        if (addKeyboardShortcuts) {
          const keyMapPlugin = keymap(addKeyboardShortcuts())

          plugins.push(keyMapPlugin)
        }

        const addInputRules = getExtensionField<AnyConfig['addInputRules']>(
          extension,
          'addInputRules',
          context,
        )

        if (this.editor.options.enableInputRules && addInputRules) {
          const inputRules = addInputRules()
          const inputRulePlugins = inputRules.length
            ? [inputRulesPlugin({ rules: inputRules })]
            : []

          plugins.push(...inputRulePlugins)
        }

        const addPasteRules = getExtensionField<AnyConfig['addPasteRules']>(
          extension,
          'addPasteRules',
          context,
        )

        if (this.editor.options.enablePasteRules && addPasteRules) {
          const pasteRulePlugins = addPasteRules()

          plugins.push(...pasteRulePlugins)
        }

        const addProseMirrorPlugins = getExtensionField<AnyConfig['addProseMirrorPlugins']>(
          extension,
          'addProseMirrorPlugins',
          context,
        )

        if (addProseMirrorPlugins) {
          const proseMirrorPlugins = addProseMirrorPlugins()

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
      .filter(extension => !!getExtensionField(extension, 'addNodeView'))
      .map(extension => {
        const name = getExtensionField<NodeConfig['name']>(extension, 'name')
        const extensionAttributes = this.attributes.filter(attribute => attribute.type === name)
        const context = {
          options: extension.options,
          editor,
          type: getNodeType(extension.config.name, this.schema),
        }
        const addNodeView = getExtensionField<NodeConfig['addNodeView']>(
          extension,
          'addNodeView',
          context,
        )

        if (!addNodeView) {
          return []
        }

        const nodeview = (
          node: ProsemirrorNode,
          view: EditorView,
          getPos: (() => number) | boolean,
          decorations: Decoration[],
        ) => {
          const HTMLAttributes = getRenderedAttributes(node, extensionAttributes)

          return addNodeView()({
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
      .filter(extension => !!getExtensionField(extension, 'renderText'))
      .map(extension => {
        const context = {
          options: extension.options,
          editor,
          type: getNodeType(extension.config.name, this.schema),
        }

        const renderText = getExtensionField<NodeConfig['renderText']>(extension, 'renderText', context)

        if (!renderText) {
          return []
        }

        const textSerializer = (props: { node: ProsemirrorNode }) => renderText(props)

        return [extension.config.name, textSerializer]
      }))
  }

}
