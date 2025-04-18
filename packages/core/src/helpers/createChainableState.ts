import type { EditorState, Transaction } from '@tiptap/pm/state'

/**
 * Takes a Transaction & Editor State and turns it into a chainable state object
 * @param config The transaction and state to create the chainable state from
 * @returns A chainable Editor state object
 */
export function createChainableState(config: { transaction: Transaction; state: EditorState }): EditorState {
  const { state, transaction } = config
  let { selection } = transaction
  let { doc } = transaction
  let { storedMarks } = transaction

  return {
    ...state,
    apply: state.apply.bind(state),
    applyTransaction: state.applyTransaction.bind(state),
    plugins: state.plugins,
    schema: state.schema,
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
      selection = transaction.selection
      doc = transaction.doc
      storedMarks = transaction.storedMarks

      return transaction
    },
  }
}
