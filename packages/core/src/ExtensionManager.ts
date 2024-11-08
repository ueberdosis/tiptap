import { keymap } from '@tiptap/pm/keymap'
import { Schema } from '@tiptap/pm/model'
import { Plugin } from '@tiptap/pm/state'
import { NodeViewConstructor } from '@tiptap/pm/view'

import type { Editor } from './Editor.js'
import { getAttributesFromExtensions } from './helpers/getAttributesFromExtensions.js'
import { getExtensionField } from './helpers/getExtensionField.js'
import { getNodeType } from './helpers/getNodeType.js'
import { getRenderedAttributes } from './helpers/getRenderedAttributes.js'
import { getSchemaByResolvedExtensions } from './helpers/getSchemaByResolvedExtensions.js'
import { getSchemaTypeByName } from './helpers/getSchemaTypeByName.js'
import { isExtensionRulesEnabled } from './helpers/isExtensionRulesEnabled.js'
import { splitExtensions } from './helpers/splitExtensions.js'
import type { NodeConfig } from './index.js'
import { InputRule, inputRulesPlugin } from './InputRule.js'
import { Mark } from './Mark.js'
import { PasteRule, pasteRulesPlugin } from './PasteRule.js'
import { AnyConfig, Extensions, RawCommands } from './types.js'
import { callOrReturn } from './utilities/callOrReturn.js'
import { findDuplicates } from './utilities/findDuplicates.js'

export class ExtensionManager {
  editor: Editor

  schema: Schema

  extensions: Extensions

  splittableMarks: string[] = []

  constructor(extensions: Extensions, editor: Editor) {
    this.editor = editor
    this.extensions = ExtensionManager.resolve(extensions)
    this.schema = getSchemaByResolvedExtensions(this.extensions, editor)
    this.setupExtensions()
  }

  /**
   * Returns a flattened and sorted extension list while
   * also checking for duplicated extensions and warns the user.
   * @param extensions An array of Tiptap extensions
   * @returns An flattened and sorted array of Tiptap extensions
   */
  static resolve(extensions: Extensions): Extensions {
    const resolvedExtensions = ExtensionManager.sort(ExtensionManager.flatten(extensions))
    const duplicatedNames = findDuplicates(resolvedExtensions.map(extension => extension.name))

    if (duplicatedNames.length) {
      console.warn(
        `[tiptap warn]: Duplicate extension names found: [${duplicatedNames
          .map(item => `'${item}'`)
          .join(', ')}]. This can lead to issues.`,
      )
    }

    return resolvedExtensions
  }

  /**
   * Create a flattened array of extensions by traversing the `addExtensions` field.
   * @param extensions An array of Tiptap extensions
   * @returns A flattened array of Tiptap extensions
   */
  static flatten(extensions: Extensions): Extensions {
    return (
      extensions
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
            return [extension, ...this.flatten(addExtensions())]
          }

          return extension
        })
        // `Infinity` will break TypeScript so we set a number that is probably high enough
        .flat(10)
    )
  }

  /**
   * Sort extensions by priority.
   * @param extensions An array of Tiptap extensions
   * @returns A sorted array of Tiptap extensions by priority
   */
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

  /**
   * Get all commands from the extensions.
   * @returns An object with all commands where the key is the command name and the value is the command function
   */
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

  /**
   * Get all registered Prosemirror plugins from the extensions.
   * @returns An array of Prosemirror plugins
   */
  get plugins(): Plugin[] {
    const { editor } = this

    // With ProseMirror, first plugins within an array are executed first.
    // In Tiptap, we provide the ability to override plugins,
    // so it feels more natural to run plugins at the end of an array first.
    // That’s why we have to reverse the `extensions` array and sort again
    // based on the `priority` option.
    const extensions = ExtensionManager.sort([...this.extensions].reverse())

    const inputRules: InputRule[] = []
    const pasteRules: PasteRule[] = []

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

        let defaultBindings: Record<string, () => boolean> = {}

        // bind exit handling
        if (extension.type === 'mark' && getExtensionField<AnyConfig['exitable']>(extension, 'exitable', context)) {
          defaultBindings.ArrowRight = () => Mark.handleExit({ editor, mark: extension as Mark })
        }

        if (addKeyboardShortcuts) {
          const bindings = Object.fromEntries(
            Object.entries(addKeyboardShortcuts()).map(([shortcut, method]) => {
              return [shortcut, () => method({ editor })]
            }),
          )

          defaultBindings = { ...defaultBindings, ...bindings }
        }

        const keyMapPlugin = keymap(defaultBindings)

        plugins.push(keyMapPlugin)

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

  /**
   * Get all attributes from the extensions.
   * @returns An array of attributes
   */
  get attributes() {
    return getAttributesFromExtensions(this.extensions)
  }

  /**
   * Get all node views from the extensions.
   * @returns An object with all node views where the key is the node name and the value is the node view function
   */
  get nodeViews(): Record<string, NodeViewConstructor> {
    const { editor } = this
    const { nodeExtensions } = splitExtensions(this.extensions)

    return Object.fromEntries(
      nodeExtensions
        .filter(extension => !!getExtensionField(extension, 'addNodeView'))
        .map(extension => {
          const extensionAttributes = this.attributes.filter(
            attribute => attribute.type === extension.name,
          )
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

          const nodeview: NodeViewConstructor = (
            node,
            view,
            getPos,
            decorations,
            innerDecorations,
          ) => {
            const HTMLAttributes = getRenderedAttributes(node, extensionAttributes)

            return addNodeView()({
              // pass-through
              node,
              view,
              getPos: getPos as () => number,
              decorations,
              innerDecorations,
              // tiptap-specific
              editor,
              extension,
              HTMLAttributes,
            })
          }

          return [extension.name, nodeview]
        }),
    )
  }

  /**
   * Go through all extensions, create extension storages & setup marks
   * & bind editor event listener.
   */
  private setupExtensions() {
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
      const onCreate = getExtensionField<AnyConfig['onCreate']>(extension, 'onCreate', context)
      const onUpdate = getExtensionField<AnyConfig['onUpdate']>(extension, 'onUpdate', context)
      const onSelectionUpdate = getExtensionField<AnyConfig['onSelectionUpdate']>(
        extension,
        'onSelectionUpdate',
        context,
      )
      const onTransaction = getExtensionField<AnyConfig['onTransaction']>(
        extension,
        'onTransaction',
        context,
      )
      const onFocus = getExtensionField<AnyConfig['onFocus']>(extension, 'onFocus', context)
      const onBlur = getExtensionField<AnyConfig['onBlur']>(extension, 'onBlur', context)
      const onDestroy = getExtensionField<AnyConfig['onDestroy']>(extension, 'onDestroy', context)

      if (onBeforeCreate) {
        this.editor.on('beforeCreate', onBeforeCreate)
      }

      if (onCreate) {
        this.editor.on('create', onCreate)
      }

      if (onUpdate) {
        this.editor.on('update', onUpdate)
      }

      if (onSelectionUpdate) {
        this.editor.on('selectionUpdate', onSelectionUpdate)
      }

      if (onTransaction) {
        this.editor.on('transaction', onTransaction)
      }

      if (onFocus) {
        this.editor.on('focus', onFocus)
      }

      if (onBlur) {
        this.editor.on('blur', onBlur)
      }

      if (onDestroy) {
        this.editor.on('destroy', onDestroy)
      }
    })
  }
}
