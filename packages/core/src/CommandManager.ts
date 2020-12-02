import { EditorState, Transaction } from 'prosemirror-state'
import { Editor } from './Editor'
import {
  SingleCommands,
  ChainedCommands,
  CanCommands,
  CommandSpec,
} from './types'
import getAllMethodNames from './utilities/getAllMethodNames'

export default class CommandManager {

  editor: Editor

  commands: { [key: string]: any } = {}

  methodNames: string[] = []

  constructor(editor: Editor) {
    this.editor = editor
    this.methodNames = getAllMethodNames(this.editor)
  }

  /**
   * Register a command.
   *
   * @param name The name of your command
   * @param callback The method of your command
   */
  public registerCommand(name: string, callback: CommandSpec): Editor {
    if (this.commands[name]) {
      throw new Error(`tiptap: command '${name}' is already defined.`)
    }

    if (this.methodNames.includes(name)) {
      throw new Error(`tiptap: '${name}' is a protected name.`)
    }

    this.commands[name] = callback

    return this.editor
  }

  public createCommands() {
    const { commands, editor } = this
    const { state, view } = editor
    const { tr } = state
    const props = this.buildProps(tr)

    return Object.fromEntries(Object
      .entries(commands)
      .map(([name, command]) => {
        const method = (...args: any) => {
          const callback = command(...args)(props)

          if (tr.steps.length) {
            view.dispatch(tr)
          }

          return callback
        }

        return [name, method]
      })) as SingleCommands
  }

  public createChain(startTr?: Transaction, shouldDispatch = true) {
    const { commands, editor } = this
    const { state, view } = editor
    const callbacks: boolean[] = []
    const hasStartTransaction = !!startTr
    const tr = startTr || state.tr

    return new Proxy({}, {
      get: (_, name: string, proxy) => {
        if (name === 'run') {
          if (!hasStartTransaction && shouldDispatch && tr.steps.length) {
            view.dispatch(tr)
          }

          return () => callbacks.every(callback => callback === true)
        }

        const command = commands[name]

        if (!command) {
          throw new Error(`tiptap: command '${name}' not found.`)
        }

        return (...args: any) => {
          const props = this.buildProps(tr, shouldDispatch)
          const callback = command(...args)(props)

          callbacks.push(callback)

          return proxy
        }
      },
    }) as ChainedCommands
  }

  public createCan(startTr?: Transaction) {
    const { commands, editor } = this
    const { state } = editor
    const dispatch = false
    const tr = startTr || state.tr
    const props = this.buildProps(tr, dispatch)
    const formattedCommands = Object.fromEntries(Object
      .entries(commands)
      .map(([name, command]) => {
        return [name, (...args: any[]) => command(...args)({ ...props, dispatch })]
      })) as SingleCommands

    return {
      ...formattedCommands,
      chain: () => this.createChain(tr, dispatch),
    } as CanCommands
  }

  public buildProps(tr: Transaction, shouldDispatch = true) {
    const { editor, commands } = this
    const { state, view } = editor

    if (state.storedMarks) {
      tr.setStoredMarks(state.storedMarks)
    }

    const props = {
      tr,
      editor,
      view,
      state: this.chainableState(tr, state),
      dispatch: shouldDispatch
        ? () => undefined
        : undefined,
      chain: () => this.createChain(tr),
      can: () => this.createCan(tr),
      get commands() {
        return Object.fromEntries(Object
          .entries(commands)
          .map(([name, command]) => {
            return [name, (...args: any[]) => command(...args)(props)]
          }))
      },
    }

    return props
  }

  public chainableState(tr: Transaction, state: EditorState): EditorState {
    let { selection } = tr
    let { doc } = tr
    let { storedMarks } = tr

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
    }
  }

}
