import { EditorState, Transaction } from "prosemirror-state";
import { ChainedCommands, Editor } from "./Editor";

export default class CommandManager {

  editor: Editor
  commands: { [key: string]: any } = {}

  constructor(editor: Editor, commands: any) {
    this.editor = editor
    this.commands = commands
  }

  public runSingleCommand(name: string) {
    const { commands, editor } = this
    const { state, view } = editor
    const command = commands[name]
    
    if (!command) {
      // TODO: prevent vue devtools to throw error
      // throw new Error(`tiptap: command '${name}' not found.`)
      return
    }
    
    return (...args: any) => {
      const { tr } = state
      const props = this.buildProps(tr)
      const callback = command(...args)(props)

      view.dispatch(tr)

      return callback
    }
  }

  public createChain(startTr?: Transaction) {
    const { commands, editor } = this
    const { state, view } = editor
    const callbacks: boolean[] = []
    const hasStartTransaction = !!startTr
    const tr = hasStartTransaction ? startTr : state.tr

    if (!tr) {
      return
    }

    return new Proxy({}, {
      get: (_, name: string, proxy) => {
        if (name === 'run') {
          if (!hasStartTransaction) {
            view.dispatch(tr)
          }

          return () => callbacks.every(callback => callback === true)
        }

        const command = commands[name]

        if (!command) {
          throw new Error(`tiptap: command '${name}' not found.`)
        }

        return (...args: any) => {
          const props = this.buildProps(tr)
          const callback = command(...args)(props)
          callbacks.push(callback)

          return proxy
        }
      }
    }) as ChainedCommands
  }

  public buildProps(tr: Transaction) {
    const { editor, commands } = this
    const { state, view } = editor

    const props = {
      tr,
      editor,
      view,
      state: this.chainableState(tr, state),
      dispatch: () => false,
      chain: () => this.createChain(tr),
      get commands() {
        return Object.fromEntries(Object
          .entries(commands)
          .map(([name, command]) => {
            return [name, (...args: any[]) => command(...args)(props)]
          }))
      }
    }

    return props
  }

  public chainableState(tr: Transaction, state: EditorState): EditorState {
    let selection = tr.selection
    let doc = tr.doc
    let storedMarks = tr.storedMarks

    return {
      ...state,
      schema: state.schema,
      plugins: state.plugins,
      apply: state.apply.bind(state),
      applyTransaction: state.applyTransaction.bind(state),
      reconfigure: state.reconfigure.bind(state),
      toJSON: state.toJSON.bind(state),
      get storedMarks() {
        return storedMarks
      },
      get selection() {
        return selection
      },
      get doc() {
        return doc
      },
      get tr() {
        selection = tr.selection
        doc = tr.doc
        storedMarks = tr.storedMarks

        return tr
      },
    };
  }

}