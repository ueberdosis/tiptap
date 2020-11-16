import { EditorState, Plugin, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser } from 'prosemirror-model'
import magicMethods from './utils/magicMethods'
import elementFromString from './utils/elementFromString'
import nodeIsActive from './utils/nodeIsActive'
import markIsActive from './utils/markIsActive'
import getNodeAttrs from './utils/getNodeAttrs'
import getMarkAttrs from './utils/getMarkAttrs'
import removeElement from './utils/removeElement'
import getSchemaTypeNameByName from './utils/getSchemaTypeNameByName'
import getHTMLFromFragment from './utils/getHTMLFromFragment'
import createStyleTag from './utils/createStyleTag'
import CommandManager from './CommandManager'
import ExtensionManager from './ExtensionManager'
import EventEmitter from './EventEmitter'
import { Extension } from './Extension'
import { NodeExtension } from './NodeExtension'
import { MarkExtension } from './MarkExtension'
import { Extensions, UnionToIntersection, PickValue } from './types'
import * as extensions from './extensions'
import style from './style'

export type Command = (props: {
  editor: Editor,
  tr: Transaction,
  commands: SingleCommands,
  can: () => SingleCommands & { chain: () => ChainedCommands },
  chain: () => ChainedCommands,
  state: EditorState,
  view: EditorView,
  dispatch: ((args?: any) => any) | undefined,
}) => boolean

export type CommandSpec = (...args: any[]) => Command

export interface CommandsSpec {
  [key: string]: CommandSpec
}

export interface AllExtensions {}

// type names = AllExtensions[keyof AllExtensions]
// type onlyExtensions = AllExtensions[keyof AllExtensions] extends Extension ? '1' : '0'
// type onlyExtensions = AllExtensions[keyof AllExtensions extends Extension ? '1' : '0']

// export type OnlyExtensions = {
//   [Item in keyof AllExtensions]: AllExtensions[Item] extends Extension
//   ? AllExtensions[Item]
//   : never
// }

// type ExtractCat<A> = A extends Extension ? A : never

// export type OnlyExtensions = ExtractCat<Item in keyof AllExtensions>

// type ExtractCommands<G> = G extends Extension<any, infer S> ? S : never
// type Test = UnionToIntersection<ExtractCommands<OnlyExtensions[keyof OnlyExtensions]>>

// type SubType<Base, Condition> = Pick<Base, {
//   [Key in keyof Base]: Base[Key] extends Condition ? Key : never
// }[keyof Base]>;

// type OnlyExtensions = SubType<AllExtensions, Extension>
// type ExtractCommands<G> = G extends Extension<any, infer S> ? S : never
// type Test = ExtractCommands<OnlyExtensions[keyof OnlyExtensions]>

// type ExtractCommands<G> = G extends Extension<any, infer S>
//   ? never
//   : G extends NodeExtension<any, infer T>
//     ? never
//     : G extends MarkExtension<any, infer U>
//       ? U
//       : never

// export type Bla = {
//   [Item in keyof AllExtensions]: AllExtensions[Item] extends Extension<any, infer S>
//     ? S
//     : AllExtensions[Item] extends NodeExtension<any, infer T>
//       ? T
//       : AllExtensions[Item] extends MarkExtension<any, infer U>
//         ? U
//         : never
// }

export type Bla = {
  [Item in keyof AllExtensions]: AllExtensions[Item] extends Extension<any, infer ExtensionCommands>
    ? ExtensionCommands
    : AllExtensions[Item] extends NodeExtension<any, infer NodeExtensionCommands>
      ? NodeExtensionCommands
      : AllExtensions[Item] extends MarkExtension<any, infer MarkExtensionCommands>
        ? MarkExtensionCommands
        : never
}

type ValuesOf<T> = T[keyof T];
type KeysWithTypeOf<T, Type> = ({[P in keyof T]: T[P] extends Type ? P : never })[keyof T]
type AllCommands = UnionToIntersection<ValuesOf<Pick<Bla, KeysWithTypeOf<Bla, {}>>>>

export type SingleCommands = {
  [Item in keyof AllCommands]: AllCommands[Item] extends (...args: any[]) => any
  ? (...args: Parameters<AllCommands[Item]>) => boolean
  : never
}

export type ChainedCommands = {
  [Item in keyof AllCommands]: AllCommands[Item] extends (...args: any[]) => any
  ? (...args: Parameters<AllCommands[Item]>) => ChainedCommands
  : never
} & {
  run: () => boolean
}

type EditorContent = string | JSON | null

interface HTMLElement {
  editor?: Editor
}

interface EditorOptions {
  element: Element,
  content: EditorContent,
  extensions: Extensions,
  injectCSS: boolean,
  autoFocus: 'start' | 'end' | number | boolean | null,
  editable: boolean,
}

@magicMethods
export class Editor extends EventEmitter {

  private proxy!: Editor

  private commandManager!: CommandManager

  private extensionManager!: ExtensionManager

  private css!: HTMLStyleElement

  public schema!: Schema

  public view!: EditorView

  public selection = { from: 0, to: 0 }

  public isFocused = false

  public options: EditorOptions = {
    element: document.createElement('div'),
    content: '',
    injectCSS: true,
    extensions: [],
    autoFocus: false,
    editable: true,
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

    window.setTimeout(() => this.commands.focus(this.options.autoFocus), 0)
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
  public registerCommands(commands: CommandsSpec) {
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
  public createDocument = (content: EditorContent, parseOptions: any = {}): any => {
    if (content && typeof content === 'object') {
      try {
        return this.schema.nodeFromJSON(content)
      } catch (error) {
        console.warn('[tiptap warn]: Invalid content.', 'Passed value:', content, 'Error:', error)
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
   * Store the current selection.
   */
  private storeSelection() {
    const { from, to } = this.state.selection
    this.selection = { from, to }
  }

  /**
   * The callback over which to send transactions (state updates) produced by the view.
   *
   * @param transaction An editor state transaction
   */
  private dispatchTransaction(transaction: Transaction) {
    const state = this.state.apply(transaction)
    this.view.updateState(state)
    this.storeSelection()
    this.emit('transaction', { transaction })

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
  public getNodeAttrs(name: string) {
    return getNodeAttrs(this.state, this.schema.nodes[name])
  }

  /**
   * Get attributes of the currently selected mark.
   *
   * @param name Name of the mark
   */
  public getMarkAttrs(name: string) {
    return getMarkAttrs(this.state, this.schema.marks[name])
  }

  /**
   * Returns if the currently selected node or mark is active.
   *
   * @param name Name of the node or mark
   * @param attrs Attributes of the node or mark
   */
  public isActive(name: string, attrs = {}) {
    const schemaType = getSchemaTypeNameByName(name, this.schema)

    if (schemaType === 'node') {
      return nodeIsActive(this.state, this.schema.nodes[name], attrs)
    } if (schemaType === 'mark') {
      return markIsActive(this.state, this.schema.marks[name], attrs)
    }

    return false
  }

  // public setParentComponent(component = null) {
  //   if (!component) {
  //     return
  //   }

  //   this.view.setProps({
  //     nodeViews: this.initNodeViews({
  //       parent: component,
  //       extensions: [
  //         ...this.builtInExtensions,
  //         ...this.options.extensions,
  //       ],
  //     }),
  //   })
  // }

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
