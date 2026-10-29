/* oslint-disableno-empty-object-type */
import type { MarkType, Node as PMNode, NodeType, Schema } from '@tiptap/pm/model'
import type { Plugin, PluginKey, Transaction } from '@tiptap/pm/state'
import { EditorState } from '@tiptap/pm/state'
import { type DirectEditorProps, EditorView } from '@tiptap/pm/view'

import { CommandManager } from './CommandManager.js'
import { isInDecorationApplyScope } from './decorations/decorationApplyScope.js'
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
import { createMappablePosition, getUpdatedPosition } from './helpers/MappablePosition.js'
import { resolveFocusPosition } from './helpers/resolveFocusPosition.js'
import { warnOnDuplicatedProseMirrorModel } from './helpers/warnOnDuplicatedProseMirrorModel.js'
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
  Utils,
} from './types.js'
import { createStyleTag } from './utilities/createStyleTag.js'
import { getEditorRuntimeOptions } from './utilities/getEditorRuntimeOptions.js'
import { isDev } from './utilities/isDev.js'
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

  private destroyed = false

  private hasMounted = false

  private hasCreated = false

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

  private hasWarnedStaleDecorationRead = false

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
    enableExtensionDispatchTransaction: true,
  }

  constructor(options: Partial<EditorOptions> = {}) {
    super()
    this.options = { ...this.options, ...options }
    this.createExtensionManager()
    this.createCommandManager()
    this.createSchema()
    this.on('beforeCreate', props => this.options.onBeforeCreate.call(this, props))
    this.emit('beforeCreate', { editor: this })
    this.on('mount', props => this.options.onMount.call(this, props))
    this.on('unmount', props => this.options.onUnmount.call(this, props))
    this.on('contentError', props => this.options.onContentError.call(this, props))
    this.on('create', props => this.options.onCreate.call(this, props))
    this.on('update', props => this.options.onUpdate.call(this, props))
    this.on('selectionUpdate', props => this.options.onSelectionUpdate.call(this, props))
    this.on('transaction', props => this.options.onTransaction.call(this, props))
    this.on('focus', props => this.options.onFocus.call(this, props))
    this.on('blur', props => this.options.onBlur.call(this, props))
    this.on('destroy', props => this.options.onDestroy.call(this, props))
    this.on('drop', ({ event, slice, moved }) => this.options.onDrop(event, slice, moved))
    this.on('paste', ({ event, slice }) => this.options.onPaste(event, slice))
    this.on('delete', props => this.options.onDelete.call(this, props))

    const initialDoc = this.createDoc()

    // createDoc() already seeds editorState from the fallback doc on a content error
    if (!this.editorState) {
      const selection = resolveFocusPosition(initialDoc, this.options.autofocus)

      this.editorState = EditorState.create({
        doc: initialDoc,
        schema: this.schema,
        selection: selection || undefined,
      })
    }

    warnOnDuplicatedProseMirrorModel(this.schema)

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
    if (this.isDestroyed) {
      throw new Error('[tiptap error]: A destroyed editor cannot be mounted.')
    }

    if (this.isMounted && this.options.element === el) {
      return
    }

    this.unmount()
    this.options.element = el
    this.createView(el)
    const view = this.editorView

    this.emit('mount', { editor: this })

    if (this.css && !document.head.contains(this.css)) {
      document.head.appendChild(this.css)
    }

    window.setTimeout(() => {
      if (this.isDestroyed || this.editorView !== view) {
        return
      }

      if (!this.hasCreated) {
        this.hasCreated = true
        if (this.options.autofocus !== false && this.options.autofocus !== null) {
          try {
            this.commands.focus(this.options.autofocus)
          } catch (error) {
            console.error('[tiptap error]: Autofocus failed.', error)
          }
        }
        this.emit('create', { editor: this })
      }
      this.isInitialized = !this.isDestroyed && this.editorView === view
    }, 0)
  }

  /**
   * Remove the editor from the DOM, but still allow remounting at a different point in time
   */
  public unmount() {
    if (!this.editorView) {
      return
    }

    this.editorState = this.editorView.state
    const dom = this.editorView.dom as TiptapEditorHTMLElement

    delete dom.editor
    this.editorView.destroy()
    this.editorView = null
    this.isInitialized = false
    this.isFocused = false

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
    if (!this.commandManager) {
      return CommandManager.createFakeChain()
    }

    return this.commandManager.chain()
  }

  /**
   * Check if a command or a command chain can be executed. Without executing it.
   */
  public can(): CanCommands {
    if (!this.commandManager) {
      return CommandManager.createFallbackCan()
    }

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
   * Update runtime options. Initial options are ignored with a warning.
   *
   * @param options Runtime options to update.
   */
  public setOptions(options: Partial<EditorOptions> = {}): void {
    const runtimeOptions = getEditorRuntimeOptions(options)

    if (isDev) {
      for (const key of Object.keys(options)) {
        if (
          !Object.hasOwn(runtimeOptions, key) &&
          Reflect.get(options, key) !== Reflect.get(this.options, key)
        ) {
          console.warn(
            `[tiptap warn]: "${key}" is an initial option and cannot be updated with setOptions(). Use setContent() for content changes or create a new editor for other initial options.`,
          )
        }
      }
    }

    this.options = { ...this.options, ...runtimeOptions }

    if (!this.editorView || !this.state || this.isDestroyed) {
      return
    }

    if (this.options.editorProps) {
      this.view.setProps({
        ...this.options.editorProps,
        attributes: this.getEditorViewAttributes(),
      })
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
    return this.options.editable && (this.editorView?.editable ?? true)
  }

  /**
   * Returns the editor view.
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
        isDestroyed: this.isDestroyed,
      } as EditorView,
      {
        get: (obj, key) => {
          if (this.editorView) {
            // If the editor view is available, but the caller has a stale reference to the proxy,
            // Just return what the editor view has.
            return this.editorView[key as keyof EditorView]
          }
          if (key === 'isDestroyed') {
            return this.isDestroyed
          }
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
    if (isDev && !this.hasWarnedStaleDecorationRead && isInDecorationApplyScope(this)) {
      // Warn once per editor. The same read repeats on every transaction, and
      // a decoration that dispatches from `create()` would flood the console.
      this.hasWarnedStaleDecorationRead = true

      console.warn(
        '[tiptap warn]: `editor.state` was read while decoration `create()` was running. ' +
          'It returns the pre-transaction document. Use the `state` argument passed to ' +
          '`create()` instead. Helpers like `editor.isActive()` read `editor.state` too, ' +
          'so pass `state` to their standalone versions instead of calling them on the editor.',
      )
    }

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
            blockSeparator:
              this.options.coreExtensionOptions?.clipboardTextSerializer?.blockSeparator,
          }),
          Commands,
          FocusEvents,
          Keymap,
          Tabindex.configure({
            value: this.options.coreExtensionOptions?.tabindex?.value,
          }),
          Drop,
          Paste,
          Delete,
          TextDirection.configure({
            direction: this.options.textDirection,
          }),
        ].filter(ext => {
          if (typeof this.options.enableCoreExtensions === 'object') {
            return (
              this.options.enableCoreExtensions[
                ext.name as keyof typeof this.options.enableCoreExtensions
              ] !== false
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
  private createDoc(): PMNode {
    let doc: PMNode

    try {
      doc = createDocument(this.options.content, this.schema, this.options.parseOptions, {
        errorOnInvalidContent: this.options.enableContentCheck,
      })
    } catch (e) {
      if (
        !(e instanceof Error) ||
        !['[tiptap error]: Invalid JSON content', '[tiptap error]: Invalid HTML content'].includes(
          e.message,
        )
      ) {
        // Not the content error we were expecting
        throw e
      }

      // Content is invalid, but attempt to create it anyway, stripping out the invalid parts
      const fallbackDoc = createDocument(
        this.options.content,
        this.schema,
        this.options.parseOptions,
        {
          errorOnInvalidContent: false,
        },
      )

      // Seed editorState with the fallback doc so a handler can safely use `editor.commands`
      this.editorState = EditorState.create({
        doc: fallbackDoc,
        schema: this.schema,
        selection: resolveFocusPosition(fallbackDoc, this.options.autofocus) || undefined,
      })

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
          this.options.extensions = this.options.extensions.filter(
            extension => extension.name !== 'collaboration',
          )

          // Restart the initialization process by recreating the extension manager with the new set of extensions
          this.createExtensionManager()
        },
      })

      return this.editorState.doc
    }
    return doc
  }

  /**
   * Returns the attributes for the editor element.
   * Merges the default `role="textbox"` with the attributes from `editorProps`,
   * so the role is kept no matter when the props are applied.
   */
  private getEditorViewAttributes(): NonNullable<DirectEditorProps['attributes']> {
    const attributes = this.options.editorProps?.attributes

    if (isFunction(attributes)) {
      return state => ({
        role: 'textbox',
        ...attributes(state),
      })
    }

    return {
      role: 'textbox',
      ...attributes,
    }
  }

  /**
   * Creates a ProseMirror view.
   */
  private createView(element: NonNullable<EditorOptions['element']>): void {
    const { editorProps, enableExtensionDispatchTransaction } = this.options
    // If a user provided a custom `dispatchTransaction` through `editorProps`,
    // we use that as the base dispatch function.
    // Otherwise, we use Tiptap's internal `dispatchTransaction` method.
    const baseDispatch =
      (editorProps as DirectEditorProps).dispatchTransaction || this.dispatchTransaction.bind(this)
    const dispatch = enableExtensionDispatchTransaction
      ? this.extensionManager.dispatchTransaction(baseDispatch)
      : baseDispatch

    // Compose transformPastedHTML from extensions and user-provided editorProps
    const baseTransformPastedHTML = (editorProps as DirectEditorProps).transformPastedHTML
    const transformPastedHTML = this.extensionManager.transformPastedHTML(baseTransformPastedHTML)

    this.editorView = new EditorView(element, {
      ...editorProps,
      attributes: this.getEditorViewAttributes(),
      dispatchTransaction: dispatch,
      transformPastedHTML,
      state: this.editorState.reconfigure({ plugins: [] }),
    })

    const state = this.hasMounted
      ? this.editorState
      : this.editorState.reconfigure({
          plugins: [...this.extensionManager.plugins, ...this.editorState.plugins],
        })

    this.hasMounted = true
    this.view.setProps({
      state,
      markViews: this.extensionManager.markViews,
      nodeViews: this.extensionManager.nodeViews,
    })

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
    if (!this.isMounted) {
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
    if (this.isDestroyed) {
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
        // oxlint-disable-next-lineno-non-null-assertion
        transaction: mostRecentFocusTr!,
      })
    }

    if (blur) {
      this.emit('blur', {
        editor: this,
        event: blur.event,
        // oxlint-disable-next-lineno-non-null-assertion
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

    const attributes =
      typeof nameOrAttributes === 'string' ? attributesOrUndefined : nameOrAttributes

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
  public getText(options?: {
    blockSeparator?: string
    textSerializers?: Record<string, TextSerializer>
  }): string {
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
    if (this.destroyed) {
      return
    }

    this.destroyed = true

    this.emit('destroy')
    this.unmount()
    this.removeAllListeners()

    this.extensionManager.destroy()
    this.extensionManager = null as any
    this.schema = null as any
    this.commandManager = null as unknown as CommandManager
    this.extensionStorage = {} as Storage
  }

  /**
   * Check if the editor is already destroyed.
   */
  public get isDestroyed(): boolean {
    return this.destroyed
  }

  /**
   * Check if the editor has an active view.
   */
  public get isMounted(): boolean {
    return !this.destroyed && this.editorView !== null && !this.editorView.isDestroyed
  }

  public $node(selector: string, attributes?: { [key: string]: any }): NodePos | null {
    return this.$doc?.querySelector(selector, attributes) || null
  }

  public $nodes(selector: string, attributes?: { [key: string]: any }): NodePos[] | null {
    return this.$doc?.querySelectorAll(selector, attributes) || null
  }

  public $pos(pos: number) {
    const $pos = this.state.doc.resolve(pos)
    // For positions directly before a non-text atom, resolvedPos.node() returns
    // the parent, so pass the atom explicitly. Container nodes and $pos(0) keep
    // resolving to the parent.
    const node =
      pos > 0 && $pos.nodeAfter && !$pos.nodeAfter.isText && $pos.nodeAfter.isAtom
        ? $pos.nodeAfter
        : null

    return new NodePos($pos, this, false, node)
  }

  get $doc() {
    return this.$pos(0)
  }

  /**
   * Returns a set of utilities for working with positions and ranges.
   */
  public utils: Utils = {
    getUpdatedPosition,
    createMappablePosition,
  }
}
