import { keymap } from 'prosemirror-keymap'
import { Node as ProsemirrorNode, Schema } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { Decoration, EditorView } from 'prosemirror-view'

import { NodeConfig } from '.'
import { Editor } from './Editor'
import { getAttributesFromExtensions } from './helpers/getAttributesFromExtensions'
import { getExtensionField } from './helpers/getExtensionField'
import { getNodeType } from './helpers/getNodeType'
import { getRenderedAttributes } from './helpers/getRenderedAttributes'
import { getSchemaByResolvedExtensions } from './helpers/getSchemaByResolvedExtensions'
import { getSchemaTypeByName } from './helpers/getSchemaTypeByName'
import { isExtensionRulesEnabled } from './helpers/isExtensionRulesEnabled'
import { splitExtensions } from './helpers/splitExtensions'
import { inputRulesPlugin } from './InputRule'
import { pasteRulesPlugin } from './PasteRule'
import { AnyConfig, Extensions, RawCommands } from './types'
import { callOrReturn } from './utilities/callOrReturn'
import { findDuplicates } from './utilities/findDuplicates'

export class ExtensionManager {

  editor: Editor

  schema: Schema

  extensions: Extensions

  splittableMarks: string[] = []

  constructor(extensions: Extensions, editor: Editor) {
    this.editor = editor
    this.extensions = ExtensionManager.resolve(extensions)
    this.schema = getSchemaByResolvedExtensions(this.extensions)

    this.extensions.forEach(extension => {
      // store extension storage in editor
      this.editor.extensionStorage[extension.name] = extension.storage

      const context = {
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
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

  static resolve(extensions: Extensions): Extensions {
    const resolvedExtensions = ExtensionManager.sort(ExtensionManager.flatten(extensions))
    const duplicatedNames = findDuplicates(resolvedExtensions.map(extension => extension.name))

    if (duplicatedNames.length) {
      console.warn(`[tiptap warn]: Duplicate extension names found: [${duplicatedNames.map(item => `'${item}'`).join(', ')}]. This can lead to issues.`)
    }

    return resolvedExtensions
  }

  static flatten(extensions: Extensions): Extensions {
    return extensions
      .map(extension => {
        const context = {
          name: extension.name,
          options: extension.options,
          storage: extension.storage,
        }

        const addExtensions = getExtensionField<AnyConfig['addExtensions']>(
          extension,
          'addExtensions',
          context,
        )

        if (addExtensions) {
          return [
            extension,
            ...this.flatten(addExtensions()),
          ]
        }

        return extension
      })
      // `Infinity` will break TypeScript so we set a number that is probably high enough
      .flat(10)
  }

  static sort(extensions: Extensions): Extensions {
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
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
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
    const { editor } = this

    // With ProseMirror, first plugins within an array are executed first.
    // In tiptap, we provide the ability to override plugins,
    // so it feels more natural to run plugins at the end of an array first.
    // That’s why we have to reverse the `extensions` array and sort again
    // based on the `priority` option.
    const extensions = ExtensionManager.sort([...this.extensions].reverse())

    const inputRules: any[] = []
    const pasteRules: any[] = []

    const allPlugins = extensions
      .map(extension => {
        const context = {
          name: extension.name,
          options: extension.options,
          storage: extension.storage,
          editor,
          type: getSchemaTypeByName(extension.name, this.schema),
        }

        const plugins: Plugin[] = []

        const addKeyboardShortcuts = getExtensionField<AnyConfig['addKeyboardShortcuts']>(
          extension,
          'addKeyboardShortcuts',
          context,
        )

        if (addKeyboardShortcuts) {
          const bindings = Object.fromEntries(
            Object
              .entries(addKeyboardShortcuts())
              .map(([shortcut, method]) => {
                return [shortcut, () => method({ editor })]
              }),
          )

          const keyMapPlugin = keymap(bindings)

          plugins.push(keyMapPlugin)
        }

        const addInputRules = getExtensionField<AnyConfig['addInputRules']>(
          extension,
          'addInputRules',
          context,
        )

        if (isExtensionRulesEnabled(extension, editor.options.enableInputRules) && addInputRules) {
          inputRules.push(...addInputRules())
        }

        const addPasteRules = getExtensionField<AnyConfig['addPasteRules']>(
          extension,
          'addPasteRules',
          context,
        )

        if (isExtensionRulesEnabled(extension, editor.options.enablePasteRules) && addPasteRules) {
          pasteRules.push(...addPasteRules())
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

    return [
      inputRulesPlugin({
        editor,
        rules: inputRules,
      }),
      ...pasteRulesPlugin({
        editor,
        rules: pasteRules,
      }),
      ...allPlugins,
    ]
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
        const extensionAttributes = this.attributes.filter(attribute => attribute.type === extension.name)
        const context = {
          name: extension.name,
          options: extension.options,
          storage: extension.storage,
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
}
