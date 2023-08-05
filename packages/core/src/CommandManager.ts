import { EditorState, Transaction } from '@tiptap/pm/state'

import { Editor } from './Editor.js'
import { createChainableState } from './helpers/createChainableState.js'
import {
  AnyCommands, CanCommands, ChainedCommands, CommandProps, SingleCommands,
} from './types.js'

/**
 * The CommandManager is responsible for managing and handling commands.
 * it also provides a chainable API for commands.
 */

export class CommandManager {
  /**
   * The editor instance.
   * @type {Editor}
   */
  editor: Editor

  /**
   * The raw commands object.
   * Raw commands are defined by the extension manager in
   * the CommandManagers constructor.
   * @type {AnyCommands}
   */
  rawCommands: AnyCommands

  /**
   * The custom state is used to run commands with a custom state.
   * @type {EditorState}
   */
  customState?: EditorState

  /**
   * Create a new CommandManager instance.
   * @param props The props of the CommandManager instance. Includes the editor instance and the custom state.
   */
  constructor(props: { editor: Editor; state?: EditorState }) {
    this.editor = props.editor
    this.rawCommands = this.editor.extensionManager.commands
    this.customState = props.state
  }

  /**
   * Boolean determining whether the CommandManager has a custom state or not
   * @type {boolean}
   */
  get hasCustomState(): boolean {
    return !!this.customState
  }

  /**
   * The current editor state. This can be a custom state or the default editor state.
   * @type {EditorState}
   */
  get state(): EditorState {
    return this.customState || this.editor.state
  }

  /**
   * The command managers registered commands. This is a formatted version of the raw commands.
   * @type {SingleCommands}
   */
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

  /**
   * The chain method used to chain multiple commands together
   * and call them in a single transaction.
   * @type {() => ChainedCommands}
   */
  get chain(): () => ChainedCommands {
    return () => this.createChain()
  }

  /**
   * A function that returns a chainable version of the commands
   * that can be run within the current editor state.
   */
  get can(): () => CanCommands {
    return () => this.createCan()
  }

  /**
   * Creates a new chain which will run all commands in a single transaction.
   * @param startTr The initial transaction object
   * @param shouldDispatch Boolean determining whether the transaction should be dispatched or not
   * @returns {ChainedCommands}
   */
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

  /**
   * Creates a new chainable version of the commands
   * where command does not dispatch but only checks if it can be run.
   * @param startTr initial transaction object
   * @returns {CanCommands}
   */
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

  /**
   * creates command props for a given transaction
   * @param tr The transaction object to create the props for
   * @param shouldDispatch Boolean determining whether the transaction should be dispatched or not
   * @returns {CommandProps}
   */
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
