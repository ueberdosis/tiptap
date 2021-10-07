import { Transaction } from 'prosemirror-state'
import { Editor } from './Editor'
import createChainableState from './helpers/createChainableState'
import {
  SingleCommands,
  ChainedCommands,
  CanCommands,
  AnyCommands,
  CommandProps,
} from './types'

export default class CommandManager {

  editor: Editor

  commands: AnyCommands

  constructor(editor: Editor, commands: AnyCommands) {
    this.editor = editor
    this.commands = commands
  }

  public createCommands(): SingleCommands {
    const { commands, editor } = this
    const { state, view } = editor
    const { tr } = state
    const props = this.buildProps(tr)

    return Object.fromEntries(Object
      .entries(commands)
      .map(([name, command]) => {
        const method = (...args: any[]) => {
          const callback = command(...args)(props)

          if (!tr.getMeta('preventDispatch')) {
            view.dispatch(tr)
          }

          return callback
        }

        return [name, method]
      })) as unknown as SingleCommands
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

      return callbacks.every(callback => callback === true)
    }

    const chain = {
      ...Object.fromEntries(Object.entries(commands).map(([name, command]) => {
        const chainedCommand = (...args: never[]) => {
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
        return [name, (...args: never[]) => command(...args)({ ...props, dispatch })]
      })) as unknown as SingleCommands

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

    const props: CommandProps = {
      tr,
      editor,
      view,
      state: createChainableState({
        state,
        transaction: tr,
      }),
      dispatch: shouldDispatch
        ? () => undefined
        : undefined,
      chain: () => this.createChain(tr),
      can: () => this.createCan(tr),
      get commands() {
        return Object.fromEntries(Object
          .entries(commands)
          .map(([name, command]) => {
            return [name, (...args: never[]) => command(...args)(props)]
          })) as unknown as SingleCommands
      },
    }

    return props
  }

}
