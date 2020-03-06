import { EventEmitter } from 'events'
import { EditorState, TextSelection } from 'prosemirror-state'
import { EditorView} from 'prosemirror-view'
import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model'
import { inputRules, undoInputRule } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'

import elementFromString from './utils/elementFromString'
import injectCSS from './utils/injectCSS'
import ExtensionManager from './ExtensionManager'

type EditorContent = string | JSON

interface Options {
  element?: Node
  content: EditorContent
  extensions: [any?]
  injectCSS: Boolean
}

export class Editor extends EventEmitter {

  extensionManager!: ExtensionManager
  schema!: Schema
  view!: EditorView
  options: Options = {
    content: '',
    injectCSS: true,
    extensions: [],
  }
  
  private lastCommand = Promise.resolve()
  
  public selection = { from: 0, to: 0 }

  constructor(options: Options) {
    super()
    this.options = { ...this.options, ...options }
    this.createExtensionManager()
    this.createSchema()
    this.createView()
    this.registerCommand('focus', require('./commands/focus').default)
    this.registerCommand('insertText', require('./commands/insertText').default)
    this.registerCommand('insertHTML', require('./commands/insertHTML').default)

    if (this.options.injectCSS) {
      injectCSS(require('./style.css'))
    }
  }

  private createExtensionManager() {
    this.extensionManager = new ExtensionManager(this.options.extensions, this)
  }

  private createSchema() {
    this.schema = new Schema({
      topNode: this.extensionManager.topNode,
      nodes: this.extensionManager.nodes,
      marks: this.extensionManager.marks,
    })
  }

  private get plugins() {
    return [
      ...this.extensionManager.plugins,
      keymap({ Backspace: undoInputRule }),
      keymap(baseKeymap),
      dropCursor(),
      gapCursor(),
    ]
  }

  private createView() {
    this.view = new EditorView(this.options.element, {
      state: EditorState.create({
        doc: this.createDocument(this.options.content),
        plugins: this.plugins,
      }),
      dispatchTransaction: this.dispatchTransaction.bind(this),
    })
  }

  private chainCommand = (method: Function) => (...args: any) => {
    this.lastCommand = this.lastCommand
      .then(() => method.apply(this, args))
      .catch(console.error)

    return this
  }

  private createDocument(content: EditorContent, parseOptions: any = {}): any {
    // if (content === null) {
    //   return this.schema.nodeFromJSON(this.options.emptyDocument)
    // }

    // if (typeof content === 'object') {
    //   try {
    //     return this.schema.nodeFromJSON(content)
    //   } catch (error) {
    //     console.warn('[tiptap warn]: Invalid content.', 'Passed value:', content, 'Error:', error)
    //     return this.schema.nodeFromJSON(this.options.emptyDocument)
    //   }
    // }

    if (typeof content === 'string') {
      return DOMParser
        .fromSchema(this.schema)
        .parse(elementFromString(content), parseOptions)
    }

    return false
  }

  private dispatchTransaction(transaction: any): void {
    const state = this.state.apply(transaction)
    this.view.updateState(state)

    const { from, to } = this.state.selection
    this.selection = { from, to }

    // this.setActiveNodesAndMarks()

    // this.emit('transaction', {
    //   getHTML: this.getHTML.bind(this),
    //   getJSON: this.getJSON.bind(this),
    //   state: this.state,
    //   transaction,
    // })
    
    if (!transaction.docChanged || transaction.getMeta('preventUpdate')) {
      return
    }

    // this.emitUpdate(transaction)
  }

  public get state() {
    return this.view.state
  }

  public setContent(content: EditorContent = '', emitUpdate: Boolean = false, parseOptions: any = {}) {
    const { doc, tr } = this.state
    const document = this.createDocument(content, parseOptions)
    const selection = TextSelection.create(doc, 0, doc.content.size)
    const transaction = tr
      .setSelection(selection)
      .replaceSelectionWith(document, false)
      .setMeta('preventUpdate', !emitUpdate)

    this.view.dispatch(transaction)

    return this
  }

  public registerCommand(name: string, method: Function): Editor {
    // @ts-ignore
    this[name] = this.chainCommand((...args: any) => {
      return new Promise(resolve => {
        // return method(resolve, this, ...args)
        return method(resolve as Function, this as Editor, ...args as any)
      })
    })

    return this
  }

  public command(name: string, ...args: any) {
    // @ts-ignore
    return this[name](...args)
  }

  public json() {
    return this.state.doc.toJSON()
  }

  public html() {
    const div = document.createElement('div')
    const fragment = DOMSerializer
      .fromSchema(this.schema)
      .serializeFragment(this.state.doc.content)

    div.appendChild(fragment)

    return div.innerHTML
  }

  public destroy() {
    if (!this.view) {
      return
    }

    this.view.destroy()
    this.removeAllListeners()
  }
  
}
