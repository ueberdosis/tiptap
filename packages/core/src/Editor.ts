/* oslint-disableno-empty-object-type */
import type { MarkType, Node as ProseMirrorNode, NodeType, Schema } from '@tiptap/pm/model'
import type { Plugin, PluginKey, Transaction } from '@tiptap/pm/state'
import { EditorState } from '@tiptap/pm/state'
import { type DirectEditorProps, EditorView } from '@tiptap/pm/view'

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
import { createMappablePosition, getUpdatedPosition } from './helpers/MappablePosition.js'
import { resolveFocusPosition } from './helpers/resolveFocusPosition.js'
import type { Storage } from './index.js'
import { NodePos } from './NodePos.js'
import { style } from './style.js'
import type {
  CanCommands,
  ChainedCommands,
  EditorEvents,
  EditorOptions,
  SingleCommands,
  TextSerializer,
  Utils,
  EditorContentJSON,
  EditorData,
} from './types.js'
import { createStyleTag } from './utilities/createStyleTag.js'
import { isFunction } from './utilities/isFunction.js'
import { applyMigrationStep, migrateDocument } from './features/migrations/migrations.js'
import type { JSONContent, Migration, MigrationOperation } from './types.js'

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

  private documentVersion: EditorData['documentVersion'] = 1

  private meta: EditorData['meta'] = {}

  /**
   * Whether the editor was initialized with the `data` option (content + meta + documentVersion)
   * or with the legacy `content` option.
   */
  public initializedWithData = false

  public schema!: Schema

  private editorView: EditorView | null = null

  public isFocused = false

  private destroyed = false

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
    migrations: [],
    migrationStepSnapshots: true,
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
    onBeforeMigrate: () => null,
    onMigrate: () => null,
    onMigrateStep: () => null,
    onMigrateError: () => null,
    onPaste: () => null,
    onDrop: () => null,
    onDelete: () => null,
    enableExtensionDispatchTransaction: true,
  }

  constructor(options: Partial<EditorOptions> = {}) {
    super()
    this.setOptions(options)
    this.createExtensionManager()
    this.createCommandManager()
    this.createSchema()

    this.documentVersion = this.options?.data?.documentVersion ?? 1
    this.meta = this.options?.data?.meta ?? {}
    this.initializedWithData = !!this.options?.data

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
    this.on('beforeMigrate', this.options.onBeforeMigrate)
    this.on('migrate', this.options.onMigrate)
    this.on('migrateStep', this.options.onMigrateStep)
    this.on('migrateError', this.options.onMigrateError)
    this.on('drop', ({ event, slice, moved }) => this.options.onDrop(event, slice, moved))
    this.on('paste', ({ event, slice }) => this.options.onPaste(event, slice))
    this.on('delete', this.options.onDelete)

    this.checkMigrationState()

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
   * Retrieves meta data by key from the editors metadata store
   * @param key The metadata to get
   * @returns The metadata value
   */
  public getMeta<K extends keyof EditorData['meta']>(key: K): EditorData['meta'][K] {
    return this.meta[key] ?? false
  }

  /**
   * Sets meta data by key on the editors metadata store
   * @param key The metadata to set
   * @param value The metadata value
   * @returns @void
   */
  public setMeta<K extends keyof EditorData['meta']>(key: K, value: EditorData['meta'][K]): void {
    this.meta[key] = value
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
  private createDoc(): ProseMirrorNode {
    let doc: ProseMirrorNode
    let content = this.options.content

    if (this.options.data) {
      content = this.options.data.content
    }

    if (this.options.migrations?.length && content && typeof content === 'object') {
      content = this.migrateContent(content as JSONContent)
    }

    try {
      doc = createDocument(content, this.schema, this.options.parseOptions, {
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

      // Content is invalid, but attempt to create it anyway, stripping out the invalid parts
      doc = createDocument(this.options.content, this.schema, this.options.parseOptions, {
        errorOnInvalidContent: false,
      })
    }
    return doc
  }

  private checkMigrationState(): void {
    const migrations = this.options.migrations

    if (!migrations?.length) {
      return
    }

    const versions = migrations.map(m => m.version)
    const maxVersion = Math.max(...versions)

    if (new Set(versions).size !== versions.length) {
      throw new Error('[tiptap error]: Duplicate migration versions')
    }

    if (this.documentVersion > maxVersion) {
      throw new Error(
        `[tiptap error]: Editor is outdated — document version (${this.documentVersion}) is newer than the latest migration (${maxVersion})`,
      )
    }
  }

  /**
   * Returns the current document schema version.
   */
  public getDocumentVersion(): number {
    return this.documentVersion
  }

  /**
   * Sets the document schema version.
   */
  public setDocumentVersion(version: number): void {
    this.documentVersion = version
  }

  /**
   * Runs document migrations on JSON content.
   */
  public migrateContent(
    content: JSONContent,
    options?: {
      documentVersion?: number
      updateDocumentVersion?: boolean
      emitEvents?: boolean
    },
  ): JSONContent {
    const migrations = this.options.migrations

    if (!migrations?.length) {
      return content
    }

    const fromVersion = options?.documentVersion ?? this.documentVersion
    const updateDocumentVersion = options?.updateDocumentVersion !== false
    const emitEvents = options?.emitEvents !== false
    const includeSnapshots = this.options.migrationStepSnapshots

    const applicable = migrations
      .filter(m => m.version > fromVersion)
      .sort((a, b) => a.version - b.version)

    if (!applicable.length) {
      return content
    }

    if (emitEvents) {
      this.emit('beforeMigrate', {
        editor: this,
        documentVersion: fromVersion,
        migrations,
      })
    }

    let migrated = { ...content }
    let currentVersion = fromVersion

    let currentMigration: Migration | undefined
    let currentStep: MigrationOperation | undefined

    try {
      for (const migration of applicable) {
        currentMigration = migration
        const oldVersion = currentVersion
        const documentBeforeMigration = JSON.parse(JSON.stringify(migrated)) as JSONContent

        if (migration.steps) {
          for (const step of migration.steps) {
            currentStep = step
            const before = includeSnapshots
              ? (JSON.parse(JSON.stringify(migrated)) as JSONContent)
              : undefined

            migrated = applyMigrationStep(migrated, step)

            if (emitEvents) {
              this.emit('migrateStep', {
                editor: this,
                step,
                ...(includeSnapshots
                  ? { before, after: JSON.parse(JSON.stringify(migrated)) as JSONContent }
                  : {}),
              })
            }
          }
        } else {
          currentStep = undefined
          migrated = migrateDocument(migrated, [migration], currentVersion, migration.version)
        }

        currentVersion = migration.version

        if (updateDocumentVersion) {
          this.documentVersion = migration.version
        }

        if (emitEvents) {
          this.emit('migrate', {
            editor: this,
            oldDocumentVersion: oldVersion,
            newDocumentVersion: migration.version,
            oldDocument: documentBeforeMigration,
            newDocument: migrated,
            migration,
          })
        }
      }
    } catch (error) {
      this.handleMigrateError(error, currentMigration, currentStep)
      throw error
    }

    return migrated
  }

  private handleMigrateError(
    error: unknown,
    migration?: Migration,
    step?: MigrationOperation,
  ): void {
    const normalizedError = error instanceof Error ? error : new Error(String(error))

    this.emit('migrateError', {
      editor: this,
      error: normalizedError,
      migration,
      step,
    })
  }

  private runMigrations(content: JSONContent): JSONContent {
    return this.migrateContent(content)
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
      attributes: {
        // add `role="textbox"` to the editor element
        role: 'textbox',
        ...editorProps?.attributes,
      },
      dispatchTransaction: dispatch,
      transformPastedHTML,
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
   * Returns the editor data for persistence (JSON content, document version, and meta).
   * Use `getHTML()` or `getMarkdown()` when you need serialized formats for export or search.
   */
  public getData(): EditorData {
    return {
      content: this.getJSON(),
      documentVersion: this.documentVersion,
      meta: this.meta,
    }
  }

  /**
   * Get the document as JSON.
   */
  public getJSON(): EditorContentJSON {
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
    this.commandManager = null as any
    this.extensionStorage = {} as Storage
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
    // When the position sits directly before a non-text node (e.g. an image or
    // other atom), nodeAfter is that node but resolvedPos.node() would return
    // the parent (often the doc at depth 0). Pass nodeAfter as the explicit node
    // so NodePos.node returns the expected node instead of the parent.
    // Keep $pos(0) returning the doc node; for other positions, prefer nodeAfter
    // when it points at a non-text node.
    const node = pos > 0 && $pos.nodeAfter && !$pos.nodeAfter.isText ? $pos.nodeAfter : null

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
