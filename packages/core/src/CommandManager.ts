import { EditorState, Transaction } from 'prosemirror-state'
import { Editor } from './Editor'
import {
  SingleCommands,
  ChainedCommands,
  CanCommands,
  Commands,
  Command,
  CommandSpec,
  CommandProps,
} from './types'
import getAllMethodNames from './utilities/getAllMethodNames'

export default class CommandManager {

  editor: Editor

  commands: Commands

  methodNames: string[] = []

  constructor(editor: Editor, commands: Commands) {
    this.editor = editor
    this.commands = commands
    this.methodNames = getAllMethodNames(this.editor)
  }

  public createCommands(): SingleCommands {
    const { commands, editor } = this
    const { state, view } = editor
    const { tr } = state
    const props = this.buildProps(tr)

    return Object.fromEntries(Object
      .entries(commands)
      .map(([name, command]) => {
        const method = (...args: any) => {
          // TODO: fix any
          const callback = command(...args as any)(props)

          if (!tr.getMeta('preventDispatch')) {
            view.dispatch(tr)
          }

          return callback
        }

        return [name, method]
      })) as SingleCommands
  }

  public createChain(startTr?: Transaction, shouldDispatch = true): ChainedCommands {
    const { commands, editor } = this
    const { state, view } = editor
    const callbacks: boolean[] = []
    const hasStartTransaction = !!startTr
    const tr = startTr || state.tr

    const run = () => {
      if (!hasStartTransaction && shouldDispatch && !tr.getMeta('preventDispatch')) {
        view.dispatch(tr)
      }

      return () => callbacks.every(callback => callback === true)
    }

    const chain = {
      ...Object.fromEntries(Object.entries(commands).map(([name, command]) => {
        const chainedCommand = (...args: any[]) => {
          const props = this.buildProps(tr, shouldDispatch)
          const callback = command(...args)(props)

          callbacks.push(callback)

          return chain
        }

        return [name, chainedCommand]
      })),
      run,
    } as unknown as ChainedCommands

    return chain
  }

  public createCan(startTr?: Transaction): CanCommands {
    const { commands, editor } = this
    const { state } = editor
    const dispatch = undefined
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

  public buildProps(tr: Transaction, shouldDispatch = true): CommandProps {
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
      // TODO: fix
      // @ts-ignore
      get commands() {
        return Object.fromEntries(Object
          .entries(commands)
          .map(([name, command]) => {
            // TODO: fix
            // @ts-ignore
            return [name, (...args: any[]) => command(...args)(props)]
          })) as SingleCommands
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
