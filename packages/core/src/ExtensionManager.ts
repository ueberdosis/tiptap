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
        type: getSchemaTypeByName(extension.name, this.schema),
      }

      if (extension.type === 'mark') {
        const keepOnSplit = callOrReturn(getExtensionField(extension, 'keepOnSplit', context)) ?? true

        if (keepOnSplit) {
          this.splittableMarks.push(extension.name)
        }
      }

      const onBeforeCreate = getExtensionField<AnyConfig['onBeforeCreate']>(
        extension,
        'onBeforeCreate',
        context,
      )

      if (onBeforeCreate) {
        this.editor.on('beforeCreate', onBeforeCreate)
      }

      const onCreate = getExtensionField<AnyConfig['onCreate']>(
        extension,
        'onCreate',
        context,
      )

      if (onCreate) {
        this.editor.on('create', onCreate)
      }

      const onUpdate = getExtensionField<AnyConfig['onUpdate']>(
        extension,
        'onUpdate',
        context,
      )

      if (onUpdate) {
        this.editor.on('update', onUpdate)
      }

      const onSelectionUpdate = getExtensionField<AnyConfig['onSelectionUpdate']>(
        extension,
        'onSelectionUpdate',
        context,
      )

      if (onSelectionUpdate) {
        this.editor.on('selectionUpdate', onSelectionUpdate)
      }

      const onTransaction = getExtensionField<AnyConfig['onTransaction']>(
        extension,
        'onTransaction',
        context,
      )

      if (onTransaction) {
        this.editor.on('transaction', onTransaction)
      }

      const onFocus = getExtensionField<AnyConfig['onFocus']>(
        extension,
        'onFocus',
        context,
      )

      if (onFocus) {
        this.editor.on('focus', onFocus)
      }

      const onBlur = getExtensionField<AnyConfig['onBlur']>(
        extension,
        'onBlur',
        context,
      )

      if (onBlur) {
        this.editor.on('blur', onBlur)
      }

      const onDestroy = getExtensionField<AnyConfig['onDestroy']>(
        extension,
        'onDestroy',
        context,
      )

      if (onDestroy) {
        this.editor.on('destroy', onDestroy)
      }
    })
  }

  private sort(extensions: Extensions) {
    const defaultPriority = 100

    return extensions.sort((a, b) => {
      const priorityA = getExtensionField<AnyConfig['priority']>(a, 'priority') || defaultPriority
      const priorityB = getExtensionField<AnyConfig['priority']>(b, 'priority') || defaultPriority

      if (priorityA > priorityB) {
        return -1
      }

      if (priorityA < priorityB) {
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
        type: getSchemaTypeByName(extension.name, this.schema),
      }

      const addCommands = getExtensionField<AnyConfig['addCommands']>(
        extension,
        'addCommands',
        context,
      )

      if (!addCommands) {
        return commands
      }

      return {
        ...commands,
        ...addCommands(),
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
          type: getSchemaTypeByName(extension.name, this.schema),
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
          type: getNodeType(extension.name, this.schema),
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

        return [extension.name, nodeview]
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
          type: getNodeType(extension.name, this.schema),
        }

        const renderText = getExtensionField<NodeConfig['renderText']>(extension, 'renderText', context)

        if (!renderText) {
          return []
        }

        const textSerializer = (props: { node: ProsemirrorNode }) => renderText(props)

        return [extension.name, textSerializer]
      }))
  }

}
