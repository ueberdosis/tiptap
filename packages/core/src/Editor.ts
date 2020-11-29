import { EditorState, Plugin, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser, Node } from 'prosemirror-model'
import magicMethods from './utils/magicMethods'
import elementFromString from './utils/elementFromString'
import getNodeAttributes from './utils/getNodeAttributes'
import getMarkAttributes from './utils/getMarkAttributes'
import isActive from './utils/isActive'
import removeElement from './utils/removeElement'
import getHTMLFromFragment from './utils/getHTMLFromFragment'
import createStyleTag from './utils/createStyleTag'
import CommandManager from './CommandManager'
import ExtensionManager from './ExtensionManager'
import EventEmitter from './EventEmitter'
import {
  EditorOptions,
  EditorContent,
  CommandSpec,
} from './types'
import * as extensions from './extensions'
import style from './style'

export { extensions }

export interface HTMLElement {
  editor?: Editor
}

@magicMethods
export class Editor extends EventEmitter {

  private proxy!: Editor

  private commandManager!: CommandManager

  private extensionManager!: ExtensionManager

  private css!: HTMLStyleElement

  public schema!: Schema

  public view!: EditorView

  public isFocused = false

  public options: EditorOptions = {
    element: document.createElement('div'),
    content: '',
    injectCSS: true,
    extensions: [],
    autofocus: false,
    editable: true,
    editorProps: {},
    parseOptions: {},
    enableInputRules: true,
    enablePasteRules: true,
    onInit: () => null,
    onUpdate: () => null,
    onSelection: () => null,
    onTransaction: () => null,
    onFocus: () => null,
    onBlur: () => null,
  }

  constructor(options: Partial<EditorOptions> = {}) {
    super()
    this.options = { ...this.options, ...options }
    this.on('createdProxy', this.init)
  }

  /**
   * This method is called after the proxy is initialized.
   */
  private init() {
    this.createCommandManager()
    this.createExtensionManager()
    this.createSchema()
    this.createView()
    this.injectCSS()
    this.on('init', this.options.onInit)
    this.on('update', this.options.onUpdate)
    this.on('selection', this.options.onSelection)
    this.on('transaction', this.options.onTransaction)
    this.on('focus', this.options.onFocus)
    this.on('blur', this.options.onBlur)

    window.setTimeout(() => {
      this.commands.focus(this.options.autofocus)
      this.emit('init')
    }, 0)
  }

  /**
   * A magic method to call commands.
   *
   * @param name The name of the command
   */
  // eslint-disable-next-line
  private __get(name: string) {
    // TODO: maybe remove proxy
  }

  /**
   * An object of all registered commands.
   */
  public get commands() {
    return this.commandManager.createCommands()
  }

  /**
   * Create a command chain to call multiple commands at once.
   */
  public chain() {
    return this.commandManager.createChain()
  }

  /**
   * Check if a command or a command chain can be executed. Without executing it.
   */
  public can() {
    return this.commandManager.createCan()
  }

  /**
   * Inject CSS styles.
   */
  private injectCSS() {
    if (this.options.injectCSS && document) {
      this.css = createStyleTag(style)
    }
  }

  /**
   * Update editor options.
   *
   * @param options A list of options
   */
  public setOptions(options: Partial<EditorOptions> = {}) {
    this.options = { ...this.options, ...options }

    if (this.view && this.state && !this.isDestroyed) {
      this.view.updateState(this.state)
    }
  }

  /**
   * Returns whether the editor is editable.
   */
  public get isEditable() {
    return this.view && this.view.editable
  }

  /**
   * Returns the editor state.
   */
  public get state() {
    return this.view.state
  }

  /**
   * Register a list of commands.
   *
   * @param commands A list of commands
   */
  public registerCommands(commands: { [key: string]: CommandSpec }) {
    Object
      .entries(commands)
      .forEach(([name, command]) => this.registerCommand(name, command))
  }

  /**
   * Register a command.
   *
   * @param name The name of your command
   * @param callback The method of your command
   */
  public registerCommand(name: string, callback: CommandSpec): Editor {
    this.commandManager.registerCommand(name, callback)

    return this.proxy
  }

  /**
   * Register a ProseMirror plugin.
   *
   * @param plugin A ProseMirror plugin
   * @param handlePlugins Control how to merge the plugin into the existing plugins.
   */
  public registerPlugin(plugin: Plugin, handlePlugins?: (newPlugin: Plugin, plugins: Plugin[]) => Plugin[]) {
    const plugins = typeof handlePlugins === 'function'
      ? handlePlugins(plugin, this.state.plugins)
      : [plugin, ...this.state.plugins]

    const state = this.state.reconfigure({ plugins })

    this.view.updateState(state)
  }

  /**
   * Unregister a ProseMirror plugin.
   *
   * @param name The plugins name
   */
  public unregisterPlugin(name: string) {
    const state = this.state.reconfigure({
      // @ts-ignore
      plugins: this.state.plugins.filter(plugin => !plugin.key.startsWith(`${name}$`)),
    })

    this.view.updateState(state)
  }

  /**
   * Creates an extension manager.
   */
  private createExtensionManager() {
    const coreExtensions = Object.entries(extensions).map(([, extension]) => extension)
    const allExtensions = [...this.options.extensions, ...coreExtensions]

    this.extensionManager = new ExtensionManager(allExtensions, this.proxy)
  }

  /**
   * Creates an command manager.
   */
  private createCommandManager() {
    this.commandManager = new CommandManager(this.proxy)
  }

  /**
   * Creates a ProseMirror schema.
   */
  private createSchema() {
    this.schema = this.extensionManager.schema
  }

  /**
   * Creates a ProseMirror view.
   */
  private createView() {
    this.view = new EditorView(this.options.element, {
      ...this.options.editorProps,
      dispatchTransaction: this.dispatchTransaction.bind(this),
      state: EditorState.create({
        doc: this.createDocument(this.options.content),
      }),
    })

    // `editor.view` is not yet available at this time.
    // Therefore we will add all plugins and node views directly afterwards.
    const newState = this.state.reconfigure({
      plugins: this.extensionManager.plugins,
    })

    this.view.updateState(newState)

    this.view.setProps({
      nodeViews: this.extensionManager.nodeViews,
    })

    // Let’s store the editor instance in the DOM element.
    // So we’ll have access to it for tests.
    const dom = this.view.dom as HTMLElement
    dom.editor = this.proxy
  }

  /**
   * Creates a ProseMirror document.
   */
  public createDocument = (content: EditorContent, parseOptions = this.options.parseOptions): Node => {
    if (content && typeof content === 'object') {
      try {
        return this.schema.nodeFromJSON(content)
      } catch (error) {
        console.warn(
          '[tiptap warn]: Invalid content.',
          'Passed value:',
          content,
          'Error:',
          error,
        )
        return this.createDocument('')
      }
    }

    if (typeof content === 'string') {
      return DOMParser
        .fromSchema(this.schema)
        .parse(elementFromString(content), parseOptions)
    }

    return this.createDocument('')
  }

  /**
   * The callback over which to send transactions (state updates) produced by the view.
   *
   * @param transaction An editor state transaction
   */
  private dispatchTransaction(transaction: Transaction) {
    const state = this.state.apply(transaction)
    const selectionHasChanged = !this.state.selection.eq(state.selection)

    this.view.updateState(state)
    this.emit('transaction', { transaction })

    if (selectionHasChanged) {
      this.emit('selection')
    }

    const focus = transaction.getMeta('focus')
    const blur = transaction.getMeta('blur')

    if (focus) {
      this.emit('focus', { event: focus.event })
    }

    if (blur) {
      this.emit('blur', { event: blur.event })
    }

    if (!transaction.docChanged || transaction.getMeta('preventUpdate')) {
      return
    }

    this.emit('update', { transaction })
  }

  /**
   * Get attributes of the currently selected node.
   *
   * @param name Name of the node
   */
  public getNodeAttributes(name: string) {
    return getNodeAttributes(this.state, this.schema.nodes[name])
  }

  /**
   * Get attributes of the currently selected mark.
   *
   * @param name Name of the mark
   */
  public getMarkAttributes(name: string) {
    return getMarkAttributes(this.state, this.schema.marks[name])
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
  public getJSON() {
    return this.state.doc.toJSON()
  }

  /**
   * Get the document as HTML.
   */
  public getHTML() {
    return getHTMLFromFragment(this.state.doc, this.schema)
  }

  /**
   * Check if there is no content.
   */
  public isEmpty() {
    return !this.state.doc.textContent.length
  }

  /**
   * Destroy the editor.
   */
  public destroy() {
    if (this.view) {
      this.view.destroy()
    }

    this.removeAllListeners()
    removeElement(this.css)
  }

  /**
   * Check if the editor is already destroyed.
   */
  private get isDestroyed() {
    // @ts-ignore
    return !this.view?.docView
  }

}
