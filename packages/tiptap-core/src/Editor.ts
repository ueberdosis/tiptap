import {EditorState, Plugin} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
// @ts-ignore
import {schema} from "prosemirror-schema-basic"
// @ts-ignore
import {addListNodes} from "prosemirror-schema-list"
// @ts-ignore
import {exampleSetup} from "prosemirror-example-setup" 

import insertText from './commands/insertText'
import focus from './commands/focus'

interface EditorOptions {
  element: Node
  content: string
}
  
export class Editor {

  private lastCommand = Promise.resolve()

  private schema: Schema = new Schema({
    nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
    marks: schema.spec.marks
  })
  
  selection = { from: 0, to: 0 }

  view: EditorView

  options: EditorOptions

  constructor(options: EditorOptions) {
    this.options = options
    this.view = this.createView()
    this.registerCommand('focus', focus)
    this.registerCommand('insertText', insertText)
  }

  get state() {
    return this.view.state
  }

  private createState() {
    return EditorState.create({
      doc: this.createDocument(this.options.content),
      plugins: [
        ...exampleSetup({schema: this.schema}),
      ],
    })
  }

  private createView() {
    return new EditorView(this.options.element, {
      state: this.createState(),
      dispatchTransaction: this.dispatchTransaction.bind(this),
    })
  }

  private chainCommand = (method: Function) => (...args: any) => {
    this.lastCommand = this.lastCommand
      .then(() => method.apply(this, args))
      .catch(console.error)

    return this
  }

  registerCommand(name: string, method: Function): Editor {
    // @ts-ignore
    this[name] = this.chainCommand((...args: any) => {
      return new Promise(resolve => {
        return method(resolve as Function, this as Editor, ...args as any)
      })
    })

    return this
  }

  command(name: string, ...args: any) {
    // @ts-ignore
    return this[name](...args)
  }

  private createDocument(content: any): any {
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
      const element = document.createElement('div')
      element.innerHTML = content.trim()

      return DOMParser.fromSchema(this.schema).parse(element)
    }

    return false
  }

  private dispatchTransaction(transaction: any): void {
    const newState = this.state.apply(transaction)
    this.view.updateState(newState)
    this.selection = {
      from: this.state.selection.from,
      to: this.state.selection.to,
    }
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
  
}
