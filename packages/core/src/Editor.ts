import { MarkType, NodeType, Schema } from 'prosemirror-model'
import {
  EditorState,
  Plugin,
  PluginKey,
  Transaction,
} from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

import { CommandManager } from './CommandManager'
import { EventEmitter } from './EventEmitter'
import { ExtensionManager } from './ExtensionManager'
import * as extensions from './extensions'
import { createDocument } from './helpers/createDocument'
import { getAttributes } from './helpers/getAttributes'
import { getHTMLFromFragment } from './helpers/getHTMLFromFragment'
import { getText } from './helpers/getText'
import { getTextSerializersFromSchema } from './helpers/getTextSerializersFromSchema'
import { isActive } from './helpers/isActive'
import { isNodeEmpty } from './helpers/isNodeEmpty'
import { resolveFocusPosition } from './helpers/resolveFocusPosition'
import { style } from './style'
import {
  CanCommands,
  ChainedCommands,
  EditorEvents,
  EditorOptions,
  JSONContent,
  SingleCommands,
  TextSerializer,
} from './types'
import { createStyleTag } from './utilities/createStyleTag'
import { isFunction } from './utilities/isFunction'

export { extensions }

export interface HTMLElement {
  editor?: Editor
}

export class Editor extends EventEmitter<EditorEvents> {

  private commandManager!: CommandManager

  public extensionManager!: ExtensionManager

  private css!: HTMLStyleElement

  public schema!: Schema

  public view!: EditorView

  public isFocused = false

  public extensionStorage: Record<string, any> = {}

  public options: EditorOptions = {
    element: document.createElement('div'),
    content: '',
    injectCSS: true,
    injectNonce: undefined,
    extensions: [],
    autofocus: false,
    editable: true,
    editorProps: {},
    parseOptions: {},
    enableInputRules: true,
    enablePasteRules: true,
    enableCoreExtensions: true,
    onBeforeCreate: () => null,
    onCreate: () => null,
    onUpdate: () => null,
    onSelectionUpdate: () => null,
    onTransaction: () => null,
    onFocus: () => null,
    onBlur: () => null,
    onDestroy: () => null,
  }

  constructor(options: Partial<EditorOptions> = {}) {
    super()
    this.setOptions(options)
    this.createExtensionManager()
    this.createCommandManager()
    this.createSchema()
    this.on('beforeCreate', this.options.onBeforeCreate)
    this.emit('beforeCreate', { editor: this })
    this.createView()
    this.injectCSS()
    this.on('create', this.options.onCreate)
    this.on('update', this.options.onUpdate)
    this.on('selectionUpdate', this.options.onSelectionUpdate)
    this.on('transaction', this.options.onTransaction)
    this.on('focus', this.options.onFocus)
    this.on('blur', this.options.onBlur)
    this.on('destroy', this.options.onDestroy)

    window.setTimeout(() => {
      if (this.isDestroyed) {
        return
      }

      this.commands.focus(this.options.autofocus)
      this.emit('create', { editor: this })
    }, 0)
  }

  /**
   * Returns the editor storage.
   */
  public get storage(): Record<string, any> {
    return this.extensionStorage
  }

  /**
   * An object of all registered commands.
   */
  public get commands(): SingleCommands {
    return this.commandManager.commands
  }

  /**
   * Create a command chain to call multiple commands at once.
   */
  public chain(): ChainedCommands {
    return this.commandManager.chain()
  }

  /**
   * Check if a command or a command chain can be executed. Without executing it.
   */
  public can(): CanCommands {
    return this.commandManager.can()
  }

  /**
   * Inject CSS styles.
   */
  private injectCSS(): void {
    if (this.options.injectCSS && document) {
      this.css = createStyleTag(style, this.options.injectNonce)
    }
  }

  /**
   * Update editor options.
   *
   * @param options A list of options
   */
  public setOptions(options: Partial<EditorOptions> = {}): void {
    this.options = {
      ...this.options,
      ...options,
    }

    if (!this.view || !this.state || this.isDestroyed) {
      return
    }

    if (this.options.editorProps) {
      this.view.setProps(this.options.editorProps)
    }

    this.view.updateState(this.state)
  }

  /**
   * Update editable state of the editor.
   */
  public setEditable(editable: boolean): void {
    this.setOptions({ editable })
    this.emit('update', { editor: this, transaction: this.state.tr })
  }

  /**
   * Returns whether the editor is editable.
   */
  public get isEditable(): boolean {
    // since plugins are applied after creating the view
    // `editable` is always `true` for one tick.
    // that’s why we also have to check for `options.editable`
    return this.options.editable
      && this.view
      && this.view.editable
  }

  /**
   * Returns the editor state.
   */
  public get state(): EditorState {
    return this.view.state
  }

  /**
   * Register a ProseMirror plugin.
   *
   * @param plugin A ProseMirror plugin
   * @param handlePlugins Control how to merge the plugin into the existing plugins.
   */
  public registerPlugin(plugin: Plugin, handlePlugins?: (newPlugin: Plugin, plugins: Plugin[]) => Plugin[]): void {
    const plugins = isFunction(handlePlugins)
      ? handlePlugins(plugin, [...this.state.plugins])
      : [...this.state.plugins, plugin]

    const state = this.state.reconfigure({ plugins })

    this.view.updateState(state)
  }

  /**
   * Unregister a ProseMirror plugin.
   *
   * @param nameOrPluginKey The plugins name
   */
  public unregisterPlugin(nameOrPluginKey: string | PluginKey): void {
    if (this.isDestroyed) {
      return
    }

    const name = typeof nameOrPluginKey === 'string'
      ? `${nameOrPluginKey}$`
      // @ts-ignore
      : nameOrPluginKey.key

    const state = this.state.reconfigure({
      // @ts-ignore
      plugins: this.state.plugins.filter(plugin => !plugin.key.startsWith(name)),
    })

    this.view.updateState(state)
  }

  /**
   * Creates an extension manager.
   */
  private createExtensionManager(): void {
    const coreExtensions = this.options.enableCoreExtensions
      ? Object.values(extensions)
      : []
    const allExtensions = [...coreExtensions, ...this.options.extensions].filter(extension => {
      return ['extension', 'node', 'mark'].includes(extension?.type)
    })

    this.extensionManager = new ExtensionManager(allExtensions, this)
  }

  /**
   * Creates an command manager.
   */
  private createCommandManager(): void {
    this.commandManager = new CommandManager({
      editor: this,
    })
  }

  /**
   * Creates a ProseMirror schema.
   */
  private createSchema(): void {
    this.schema = this.extensionManager.schema
  }

  /**
   * Creates a ProseMirror view.
   */
  private createView(): void {
    const doc = createDocument(this.options.content, this.schema, this.options.parseOptions)
    const selection = resolveFocusPosition(doc, this.options.autofocus)

    this.view = new EditorView(this.options.element, {
      ...this.options.editorProps,
      dispatchTransaction: this.dispatchTransaction.bind(this),
      state: EditorState.create({
        doc,
        selection: selection || undefined,
      }),
    })

    // `editor.view` is not yet available at this time.
    // Therefore we will add all plugins and node views directly afterwards.
    const newState = this.state.reconfigure({
      plugins: this.extensionManager.plugins,
    })

    this.view.updateState(newState)

    this.createNodeViews()

    // Let’s store the editor instance in the DOM element.
    // So we’ll have access to it for tests.
    const dom = this.view.dom as HTMLElement

    dom.editor = this
  }

  /**
   * Creates all node views.
   */
  public createNodeViews(): void {
    this.view.setProps({
      nodeViews: this.extensionManager.nodeViews,
    })
  }

  public isCapturingTransaction = false

  private capturedTransaction: Transaction | null = null

  public captureTransaction(fn: Function) {
    this.isCapturingTransaction = true
    fn()
    this.isCapturingTransaction = false

    const tr = this.capturedTransaction

    this.capturedTransaction = null

    return tr
  }

  /**
   * The callback over which to send transactions (state updates) produced by the view.
   *
   * @param transaction An editor state transaction
   */
  private dispatchTransaction(transaction: Transaction): void {
    if (this.isCapturingTransaction) {
      if (!this.capturedTransaction) {
        this.capturedTransaction = transaction

        return
      }

      transaction.steps.forEach(step => this.capturedTransaction?.step(step))

      return
    }

    const state = this.state.apply(transaction)
    const selectionHasChanged = !this.state.selection.eq(state.selection)

    this.view.updateState(state)
    this.emit('transaction', {
      editor: this,
      transaction,
    })

    if (selectionHasChanged) {
      this.emit('selectionUpdate', {
        editor: this,
        transaction,
      })
    }

    const focus = transaction.getMeta('focus')
    const blur = transaction.getMeta('blur')

    if (focus) {
      this.emit('focus', {
        editor: this,
        event: focus.event,
        transaction,
      })
    }

    if (blur) {
      this.emit('blur', {
        editor: this,
        event: blur.event,
        transaction,
      })
    }

    if (!transaction.docChanged || transaction.getMeta('preventUpdate')) {
      return
    }

    this.emit('update', {
      editor: this,
      transaction,
    })
  }

  /**
   * Get attributes of the currently selected node or mark.
   */
  public getAttributes(nameOrType: string | NodeType | MarkType): Record<string, any> {
    return getAttributes(this.state, nameOrType)
  }

  /**
   * Returns if the currently selected node or mark is active.
   *
   * @param name Name of the node or mark
   * @param attributes Attributes of the node or mark
   */
  public isActive(name: string, attributes?: {}): boolean;
  public isActive(attributes: {}): boolean;
  public isActive(nameOrAttributes: string, attributesOrUndefined?: {}): boolean {
    const name = typeof nameOrAttributes === 'string'
      ? nameOrAttributes
      : null

    const attributes = typeof nameOrAttributes === 'string'
      ? attributesOrUndefined
      : nameOrAttributes

    return isActive(this.state, name, attributes)
  }

  /**
   * Get the document as JSON.
   */
  public getJSON(): JSONContent {
    return this.state.doc.toJSON()
  }

  /**
   * Get the document as HTML.
   */
  public getHTML(): string {
    return getHTMLFromFragment(this.state.doc.content, this.schema)
  }

  /**
   * Get the document as text.
   */
  public getText(options?: {
    blockSeparator?: string,
    textSerializers?: Record<string, TextSerializer>,
  }): string {
    const {
      blockSeparator = '\n\n',
      textSerializers = {},
    } = options || {}

    return getText(this.state.doc, {
      blockSeparator,
      textSerializers: {
        ...textSerializers,
        ...getTextSerializersFromSchema(this.schema),
      },
    })
  }

  /**
   * Check if there is no content.
   */
  public get isEmpty(): boolean {
    return isNodeEmpty(this.state.doc)
  }

  /**
   * Get the number of characters for the current document.
   *
   * @deprecated
   */
  public getCharacterCount(): number {
    console.warn('[tiptap warn]: "editor.getCharacterCount()" is deprecated. Please use "editor.storage.characterCount.characters()" instead.')

    return this.state.doc.content.size - 2
  }

  /**
   * Destroy the editor.
   */
  public destroy(): void {
    this.emit('destroy')

    if (this.view) {
      this.view.destroy()
    }

    this.removeAllListeners()
  }

  /**
   * Check if the editor is already destroyed.
   */
  public get isDestroyed(): boolean {
    // @ts-ignore
    return !this.view?.docView
  }

}
