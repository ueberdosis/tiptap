import { EditorState, Transaction } from 'prosemirror-state'
import {
  SingleCommands, ChainedCommands, Editor, CommandSpec,
} from './Editor'
import getAllMethodNames from './utils/getAllMethodNames'

export default class CommandManager {

  editor: Editor

  rawCommands: { [key: string]: any } = {}

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
    if (this.rawCommands[name]) {
      throw new Error(`tiptap: command '${name}' is already defined.`)
    }

    if (this.methodNames.includes(name)) {
      throw new Error(`tiptap: '${name}' is a protected name.`)
    }

    this.rawCommands[name] = callback

    return this.editor
  }

  public get commands() {
    return {
      ...this.wrapCommands(),
      chain: () => this.createChain(),
      can: () => this.createCan(),
    }
  }

  public wrapCommands() {
    const { rawCommands, editor } = this
    const { state, view } = editor

    return Object.fromEntries(Object
      .entries(rawCommands)
      .map(([name, command]) => {
        const method = (...args: any) => {
          const { tr } = state
          const props = this.buildProps(tr)
          const callback = command(...args)(props)

          view.dispatch(tr)

          return callback
        }

        return [name, method]
      })) as SingleCommands
  }

  public runSingleCommand(name: string) {
    const { rawCommands, editor } = this
    const { state, view } = editor
    const command = rawCommands[name]

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

  public createChain(startTr?: Transaction, shouldDispatch = true) {
    const { rawCommands, editor } = this
    const { state, view } = editor
    const callbacks: boolean[] = []
    const hasStartTransaction = !!startTr
    const tr = startTr || state.tr

    return new Proxy({}, {
      get: (_, name: string, proxy) => {
        if (name === 'run') {
          if (!hasStartTransaction && shouldDispatch) {
            view.dispatch(tr)
          }

          return () => callbacks.every(callback => callback === true)
        }

        const command = rawCommands[name]

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
    const { rawCommands, editor } = this
    const { state } = editor
    const dispatch = false
    const tr = startTr || state.tr
    const props = this.buildProps(tr, dispatch)
    const formattedCommands = Object.fromEntries(Object
      .entries(rawCommands)
      .map(([name, command]) => {
        return [name, (...args: any[]) => command(...args)({ ...props, dispatch })]
      })) as SingleCommands

    return {
      ...formattedCommands,
      chain: () => this.createChain(tr, dispatch),
    }
  }

  public buildProps(tr: Transaction, shouldDispatch = true) {
    const { editor, rawCommands } = this
    const { state, view } = editor

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
          .entries(rawCommands)
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
