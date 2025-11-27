/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { MarkType, Node as ProseMirrorNode, NodeType, Schema } from '@tiptap/pm/model'
import type { Plugin, PluginKey, Transaction } from '@tiptap/pm/state'
import { EditorState } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'

import { CommandManager } from './CommandManager.js'
import { EventEmitter } from './EventEmitter.js'
import { ExtensionManager } from './ExtensionManager.js'
import {
  ClipboardTextSerializer,
  Commands,
  Delete,
  Drop,
  Editable,
  FocusEvents,
  Keymap,
  Paste,
  Tabindex,
  TextDirection,
} from './extensions/index.js'
import { createDocument } from './helpers/createDocument.js'
import { getAttributes } from './helpers/getAttributes.js'
import { getHTMLFromFragment } from './helpers/getHTMLFromFragment.js'
import { getText } from './helpers/getText.js'
import { getTextSerializersFromSchema } from './helpers/getTextSerializersFromSchema.js'
import { isActive } from './helpers/isActive.js'
import { isNodeEmpty } from './helpers/isNodeEmpty.js'
import { resolveFocusPosition } from './helpers/resolveFocusPosition.js'
import type { Storage } from './index.js'
import { NodePos } from './NodePos.js'
import { style } from './style.js'
import type {
  CanCommands,
  ChainedCommands,
  DocumentType,
  EditorEvents,
  EditorOptions,
  NodeType as TNodeType,
  SingleCommands,
  TextSerializer,
  TextType as TTextType,
} from './types.js'
import { createStyleTag } from './utilities/createStyleTag.js'
import { isFunction } from './utilities/isFunction.js'

export * as extensions from './extensions/index.js'

// @ts-ignore
export interface TiptapEditorHTMLElement extends HTMLElement {
  editor?: Editor
}

export class Editor extends EventEmitter<EditorEvents> {
  private commandManager!: CommandManager

  public extensionManager!: ExtensionManager

  private css: HTMLStyleElement | null = null

  private className = 'tiptap'

  public schema!: Schema

  private editorView: EditorView | null = null

  public isFocused = false

  private editorState!: EditorState

  /**
   * The editor is considered initialized after the `create` event has been emitted.
   */
  public isInitialized = false

  public extensionStorage: Storage = {} as Storage

  /**
   * A unique ID for this editor instance.
   */
  public instanceId = Math.random().toString(36).slice(2, 9)

  public options: EditorOptions = {
    element: typeof document !== 'undefined' ? document.createElement('div') : null,
    content: '',
    injectCSS: true,
    injectNonce: undefined,
    extensions: [],
    autofocus: false,
    editable: true,
    textDirection: undefined,
    editorProps: {},
    parseOptions: {},
    coreExtensionOptions: {},
    enableInputRules: true,
    enablePasteRules: true,
    enableCoreExtensions: true,
    enableContentCheck: false,
    emitContentError: false,
    onBeforeCreate: () => null,
    onCreate: () => null,
    onMount: () => null,
    onUnmount: () => null,
    onUpdate: () => null,
    onSelectionUpdate: () => null,
    onTransaction: () => null,
    onFocus: () => null,
    onBlur: () => null,
    onDestroy: () => null,
    onContentError: ({ error }) => {
      throw error
    },
    onPaste: () => null,
    onDrop: () => null,
    onDelete: () => null,
  }

  constructor(options: Partial<EditorOptions> = {}) {
    super()
    this.setOptions(options)
    this.createExtensionManager()
    this.createCommandManager()
    this.createSchema()
    this.on('beforeCreate', this.options.onBeforeCreate)
    this.emit('beforeCreate', { editor: this })
    this.on('mount', this.options.onMount)
    this.on('unmount', this.options.onUnmount)
    this.on('contentError', this.options.onContentError)
    this.on('create', this.options.onCreate)
    this.on('update', this.options.onUpdate)
    this.on('selectionUpdate', this.options.onSelectionUpdate)
    this.on('transaction', this.options.onTransaction)
    this.on('focus', this.options.onFocus)
    this.on('blur', this.options.onBlur)
    this.on('destroy', this.options.onDestroy)
    this.on('drop', ({ event, slice, moved }) => this.options.onDrop(event, slice, moved))
    this.on('paste', ({ event, slice }) => this.options.onPaste(event, slice))
    this.on('delete', this.options.onDelete)

    const initialDoc = this.createDoc()
    const selection = resolveFocusPosition(initialDoc, this.options.autofocus)

    // Set editor state immediately, so that it's available independently from the view
    this.editorState = EditorState.create({
      doc: initialDoc,
      schema: this.schema,
      selection: selection || undefined,
    })

    if (this.options.element) {
      this.mount(this.options.element)
    }
  }

  /**
   * Attach the editor to the DOM, creating a new editor view.
   */
  public mount(el: NonNullable<EditorOptions['element']> & {}) {
    if (typeof document === 'undefined') {
      throw new Error(
        `[tiptap error]: The editor cannot be mounted because there is no 'document' defined in this environment.`,
      )
    }
    this.createView(el)
    this.emit('mount', { editor: this })

    if (this.css && !document.head.contains(this.css)) {
      document.head.appendChild(this.css)
    }

    window.setTimeout(() => {
      if (this.isDestroyed) {
        return
      }

      if (this.options.autofocus !== false && this.options.autofocus !== null) {
        this.commands.focus(this.options.autofocus)
      }
      this.emit('create', { editor: this })
      this.isInitialized = true
    }, 0)
  }

  /**
   * Remove the editor from the DOM, but still allow remounting at a different point in time
   */
  public unmount() {
    if (this.editorView) {
      // Cleanup our reference to prevent circular references which caused memory leaks
      // @ts-ignore
      const dom = this.editorView.dom as TiptapEditorHTMLElement

      if (dom?.editor) {
        delete dom.editor
      }
      this.editorView.destroy()
    }
    this.editorView = null
    this.isInitialized = false

    // Safely remove CSS element with fallback for test environments
    // Only remove CSS if no other editors exist in the document after unmount
    if (this.css && !document.querySelectorAll(`.${this.className}`).length) {
      try {
        if (typeof this.css.remove === 'function') {
          this.css.remove()
        } else if (this.css.parentNode) {
          this.css.parentNode.removeChild(this.css)
        }
      } catch (error) {
        // Silently handle any unexpected DOM removal errors in test environments
        console.warn('Failed to remove CSS element:', error)
      }
    }
    this.css = null
    this.emit('unmount', { editor: this })
  }

  /**
   * Returns the editor storage.
   */
  public get storage(): Storage {
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
    if (this.options.injectCSS && typeof document !== 'undefined') {
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

    if (!this.editorView || !this.state || this.isDestroyed) {
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
  public setEditable(editable: boolean, emitUpdate = true): void {
    this.setOptions({ editable })

    if (emitUpdate) {
      this.emit('update', { editor: this, transaction: this.state.tr, appendedTransactions: [] })
    }
  }

  /**
   * Returns whether the editor is editable.
   */
  public get isEditable(): boolean {
    // since plugins are applied after creating the view
    // `editable` is always `true` for one tick.
    // that’s why we also have to check for `options.editable`
    return this.options.editable && this.view && this.view.editable
  }

  /**
   * Returns the editor state.
   */
  public get view(): EditorView {
    if (this.editorView) {
      return this.editorView
    }

    return new Proxy(
      {
        state: this.editorState,
        updateState: (state: EditorState): ReturnType<EditorView['updateState']> => {
          this.editorState = state
        },
        dispatch: (tr: Transaction): ReturnType<EditorView['dispatch']> => {
          this.dispatchTransaction(tr)
        },

        // Stub some commonly accessed properties to prevent errors
        composing: false,
        dragging: null,
        editable: true,
        isDestroyed: false,
      } as EditorView,
      {
        get: (obj, key) => {
          if (this.editorView) {
            // If the editor view is available, but the caller has a stale reference to the proxy,
            // Just return what the editor view has.
            return this.editorView[key as keyof EditorView]
          }
          // Specifically always return the most recent editorState
          if (key === 'state') {
            return this.editorState
          }
          if (key in obj) {
            return Reflect.get(obj, key)
          }

          // We throw an error here, because we know the view is not available
          throw new Error(
            `[tiptap error]: The editor view is not available. Cannot access view['${key as string}']. The editor may not be mounted yet.`,
          )
        },
      },
    ) as EditorView
  }

  /**
   * Returns the editor state.
   */
  public get state(): EditorState {
    if (this.editorView) {
      this.editorState = this.view.state
    }

    return this.editorState
  }

  /**
   * Register a ProseMirror plugin.
   *
   * @param plugin A ProseMirror plugin
   * @param handlePlugins Control how to merge the plugin into the existing plugins.
   * @returns The new editor state
   */
  public registerPlugin(
    plugin: Plugin,
    handlePlugins?: (newPlugin: Plugin, plugins: Plugin[]) => Plugin[],
  ): EditorState {
    const plugins = isFunction(handlePlugins)
      ? handlePlugins(plugin, [...this.state.plugins])
      : [...this.state.plugins, plugin]

    const state = this.state.reconfigure({ plugins })

    this.view.updateState(state)

    return state
  }

  /**
   * Unregister a ProseMirror plugin.
   *
   * @param nameOrPluginKeyToRemove The plugins name
   * @returns The new editor state or undefined if the editor is destroyed
   */
  public unregisterPlugin(
    nameOrPluginKeyToRemove: string | PluginKey | (string | PluginKey)[],
  ): EditorState | undefined {
    if (this.isDestroyed) {
      return undefined
    }

    const prevPlugins = this.state.plugins
    let plugins = prevPlugins

    ;([] as (string | PluginKey)[]).concat(nameOrPluginKeyToRemove).forEach(nameOrPluginKey => {
      // @ts-ignore
      const name = typeof nameOrPluginKey === 'string' ? `${nameOrPluginKey}$` : nameOrPluginKey.key

      // @ts-ignore
      plugins = plugins.filter(plugin => !plugin.key.startsWith(name))
    })

    if (prevPlugins.length === plugins.length) {
      // No plugin was removed, so we don’t need to update the state
      return undefined
    }

    const state = this.state.reconfigure({
      plugins,
    })

    this.view.updateState(state)

    return state
  }

  /**
   * Creates an extension manager.
   */
  private createExtensionManager(): void {
    const coreExtensions = this.options.enableCoreExtensions
      ? [
          Editable,
          ClipboardTextSerializer.configure({
            blockSeparator: this.options.coreExtensionOptions?.clipboardTextSerializer?.blockSeparator,
          }),
          Commands,
          FocusEvents,
          Keymap,
          Tabindex,
          Drop,
          Paste,
          Delete,
          TextDirection.configure({
            direction: this.options.textDirection,
          }),
        ].filter(ext => {
          if (typeof this.options.enableCoreExtensions === 'object') {
            return (
              this.options.enableCoreExtensions[ext.name as keyof typeof this.options.enableCoreExtensions] !== false
            )
          }
          return true
        })
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
   * Creates the initial document.
   */
  private createDoc(): ProseMirrorNode {
    let doc: ProseMirrorNode

    try {
      doc = createDocument(this.options.content, this.schema, this.options.parseOptions, {
        errorOnInvalidContent: this.options.enableContentCheck,
      })
    } catch (e) {
      if (
        !(e instanceof Error) ||
        !['[tiptap error]: Invalid JSON content', '[tiptap error]: Invalid HTML content'].includes(e.message)
      ) {
        // Not the content error we were expecting
        throw e
      }
      this.emit('contentError', {
        editor: this,
        error: e as Error,
        disableCollaboration: () => {
          if (
            'collaboration' in this.storage &&
            typeof this.storage.collaboration === 'object' &&
            this.storage.collaboration
          ) {
            ;(this.storage.collaboration as any).isDisabled = true
          }
          // To avoid syncing back invalid content, reinitialize the extensions without the collaboration extension
          this.options.extensions = this.options.extensions.filter(extension => extension.name !== 'collaboration')

          // Restart the initialization process by recreating the extension manager with the new set of extensions
          this.createExtensionManager()
        },
      })

      // Content is invalid, but attempt to create it anyway, stripping out the invalid parts
      doc = createDocument(this.options.content, this.schema, this.options.parseOptions, {
        errorOnInvalidContent: false,
      })
    }
    return doc
  }

  /**
   * Creates a ProseMirror view.
   */
  private createView(element: NonNullable<EditorOptions['element']>): void {
    this.editorView = new EditorView(element, {
      ...this.options.editorProps,
      attributes: {
        // add `role="textbox"` to the editor element
        role: 'textbox',
        ...this.options.editorProps?.attributes,
      },
      dispatchTransaction: this.dispatchTransaction.bind(this),
      state: this.editorState,
      markViews: this.extensionManager.markViews,
      nodeViews: this.extensionManager.nodeViews,
    })

    // `editor.view` is not yet available at this time.
    // Therefore we will add all plugins and node views directly afterwards.
    const newState = this.state.reconfigure({
      plugins: this.extensionManager.plugins,
    })

    this.view.updateState(newState)

    this.prependClass()
    this.injectCSS()

    // Let’s store the editor instance in the DOM element.
    // So we’ll have access to it for tests.
    // @ts-ignore
    const dom = this.view.dom as TiptapEditorHTMLElement

    dom.editor = this
  }

  /**
   * Creates all node and mark views.
   */
  public createNodeViews(): void {
    if (this.view.isDestroyed) {
      return
    }

    this.view.setProps({
      markViews: this.extensionManager.markViews,
      nodeViews: this.extensionManager.nodeViews,
    })
  }

  /**
   * Prepend class name to element.
   */
  public prependClass(): void {
    this.view.dom.className = `${this.className} ${this.view.dom.className}`
  }

  public isCapturingTransaction = false

  private capturedTransaction: Transaction | null = null

  public captureTransaction(fn: () => void) {
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
    // if the editor / the view of the editor was destroyed
    // the transaction should not be dispatched as there is no view anymore.
    if (this.view.isDestroyed) {
      return
    }

    if (this.isCapturingTransaction) {
      if (!this.capturedTransaction) {
        this.capturedTransaction = transaction

        return
      }

      transaction.steps.forEach(step => this.capturedTransaction?.step(step))

      return
    }

    // Apply transaction and get resulting state and transactions
    const { state, transactions } = this.state.applyTransaction(transaction)
    const selectionHasChanged = !this.state.selection.eq(state.selection)
    const rootTrWasApplied = transactions.includes(transaction)
    const prevState = this.state

    this.emit('beforeTransaction', {
      editor: this,
      transaction,
      nextState: state,
    })

    // If transaction was filtered out, we can return early
    if (!rootTrWasApplied) {
      return
    }

    this.view.updateState(state)

    // Emit transaction event with appended transactions info
    this.emit('transaction', {
      editor: this,
      transaction,
      appendedTransactions: transactions.slice(1),
    })

    if (selectionHasChanged) {
      this.emit('selectionUpdate', {
        editor: this,
        transaction,
      })
    }

    // Only emit the latest between focus and blur events
    const mostRecentFocusTr = transactions.findLast(tr => tr.getMeta('focus') || tr.getMeta('blur'))
    const focus = mostRecentFocusTr?.getMeta('focus')
    const blur = mostRecentFocusTr?.getMeta('blur')

    if (focus) {
      this.emit('focus', {
        editor: this,
        event: focus.event,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        transaction: mostRecentFocusTr!,
      })
    }

    if (blur) {
      this.emit('blur', {
        editor: this,
        event: blur.event,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        transaction: mostRecentFocusTr!,
      })
    }

    // Compare states for update event
    if (
      transaction.getMeta('preventUpdate') ||
      !transactions.some(tr => tr.docChanged) ||
      prevState.doc.eq(state.doc)
    ) {
      return
    }

    this.emit('update', {
      editor: this,
      transaction,
      appendedTransactions: transactions.slice(1),
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
  public isActive(name: string, attributes?: {}): boolean
  public isActive(attributes: {}): boolean
  public isActive(nameOrAttributes: string, attributesOrUndefined?: {}): boolean {
    const name = typeof nameOrAttributes === 'string' ? nameOrAttributes : null

    const attributes = typeof nameOrAttributes === 'string' ? attributesOrUndefined : nameOrAttributes

    return isActive(this.state, name, attributes)
  }

  /**
   * Get the document as JSON.
   */
  public getJSON(): DocumentType<
    Record<string, any> | undefined,
    TNodeType<string, undefined | Record<string, any>, any, (TNodeType | TTextType)[]>[]
  > {
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
  public getText(options?: { blockSeparator?: string; textSerializers?: Record<string, TextSerializer> }): string {
    const { blockSeparator = '\n\n', textSerializers = {} } = options || {}

    return getText(this.state.doc, {
      blockSeparator,
      textSerializers: {
        ...getTextSerializersFromSchema(this.schema),
        ...textSerializers,
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
   * Destroy the editor.
   */
  public destroy(): void {
    this.emit('destroy')

    this.unmount()

    this.removeAllListeners()
  }

  /**
   * Check if the editor is already destroyed.
   */
  public get isDestroyed(): boolean {
    return this.editorView?.isDestroyed ?? true
  }

  public $node(selector: string, attributes?: { [key: string]: any }): NodePos | null {
    return this.$doc?.querySelector(selector, attributes) || null
  }

  public $nodes(selector: string, attributes?: { [key: string]: any }): NodePos[] | null {
    return this.$doc?.querySelectorAll(selector, attributes) || null
  }

  public $pos(pos: number) {
    const $pos = this.state.doc.resolve(pos)

    return new NodePos($pos, this)
  }

  get $doc() {
    return this.$pos(0)
  }
}
