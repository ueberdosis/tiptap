import { EditorState, Transaction } from '@tiptap/pm/state'

import { Editor } from './Editor.js'
import { createChainableState } from './helpers/createChainableState.js'
import {
  AnyCommands, CanCommands, ChainedCommands, CommandProps, SingleCommands,
} from './types.js'

export class CommandManager {
  editor: Editor

  rawCommands: AnyCommands

  customState?: EditorState

  constructor(props: { editor: Editor; state?: EditorState }) {
    this.editor = props.editor
    this.rawCommands = this.editor.extensionManager.commands
    this.customState = props.state
  }

  get hasCustomState(): boolean {
    return !!this.customState
  }

  get state(): EditorState {
    return this.customState || this.editor.state
  }

  get commands(): SingleCommands {
    const { rawCommands, editor, state } = this
    const { view } = editor
    const { tr } = state
    const props = this.buildProps(tr)

    return Object.fromEntries(
      Object.entries(rawCommands).map(([name, command]) => {
        const method = (...args: any[]) => {
          const callback = command(...args)(props)

          if (!tr.getMeta('preventDispatch') && !this.hasCustomState) {
            view.dispatch(tr)
          }

          return callback
        }

        return [name, method]
      }),
    ) as unknown as SingleCommands
  }

  get chain(): () => ChainedCommands {
    return () => this.createChain()
  }

  get can(): () => CanCommands {
    return () => this.createCan()
  }

  public createChain(startTr?: Transaction, shouldDispatch = true): ChainedCommands {
    const { rawCommands, editor, state } = this
    const { view } = editor
    const callbacks: boolean[] = []
    const hasStartTransaction = !!startTr
    const tr = startTr || state.tr

    const run = () => {
      if (
        !hasStartTransaction
        && shouldDispatch
        && !tr.getMeta('preventDispatch')
        && !this.hasCustomState
      ) {
        view.dispatch(tr)
      }

      return callbacks.every(callback => callback === true)
    }

    const chain = {
      ...Object.fromEntries(
        Object.entries(rawCommands).map(([name, command]) => {
          const chainedCommand = (...args: never[]) => {
            const props = this.buildProps(tr, shouldDispatch)
            const callback = command(...args)(props)

            callbacks.push(callback)

            return chain
          }

          return [name, chainedCommand]
        }),
      ),
      run,
    } as unknown as ChainedCommands

    return chain
  }

  public createCan(startTr?: Transaction): CanCommands {
    const { rawCommands, state } = this
    const dispatch = false
    const tr = startTr || state.tr
    const props = this.buildProps(tr, dispatch)
    const formattedCommands = Object.fromEntries(
      Object.entries(rawCommands).map(([name, command]) => {
        return [name, (...args: never[]) => command(...args)({ ...props, dispatch: undefined })]
      }),
    ) as unknown as SingleCommands

    return {
      ...formattedCommands,
      chain: () => this.createChain(tr, dispatch),
    } as CanCommands
  }

  public buildProps(tr: Transaction, shouldDispatch = true): CommandProps {
    const { rawCommands, editor, state } = this
    const { view } = editor

    const props: CommandProps = {
      tr,
      editor,
      view,
      state: createChainableState({
        state,
        transaction: tr,
      }),
      dispatch: shouldDispatch ? () => undefined : undefined,
      chain: () => this.createChain(tr, shouldDispatch),
      can: () => this.createCan(tr),
      get commands() {
        return Object.fromEntries(
          Object.entries(rawCommands).map(([name, command]) => {
            return [name, (...args: never[]) => command(...args)(props)]
          }),
        ) as unknown as SingleCommands
      },
    }

    return props
  }
}
