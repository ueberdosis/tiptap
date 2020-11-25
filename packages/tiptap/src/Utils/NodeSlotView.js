import Vue from 'vue'
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { keymap } from 'prosemirror-keymap'
import { StepMap } from 'prosemirror-transform'
import { undo, redo } from 'prosemirror-history'

export default class NodeSlotView {

  constructor(parentComponent, {
    editor,
    extension,
    parent,
    node,
    view,
    decorations,
    getPos,
  }) {
    this.parentComponent = parentComponent
    this.editor = editor
    this.extension = extension
    this.parent = parent
    this.node = node
    this.view = view
    this.getPos = getPos
    this.decorations = decorations
    this.dom = this.createDOM()
    console.log(this)
  }

  createDOM() {
    this.vm = new EditorView(this.view, {
      // You can use any node as an editor document
      state: EditorState.create({
        doc: this.node,
        plugins: [keymap({
          'Mod-z': () => undo(this.view.state, this.view.dispatch),
          'Mod-y': () => redo(this.view.state, this.view.dispatch),
        })],
        dispatchTransaction: this.dispatchInner.bind(this),
        handleDOMEvents: {
          mousedown: () => {
            // Kludge to prevent issues due to the fact that the whole
            // footnote is node-selected (and thus DOM-selected) when
            // the parent editor is focused.
            if (this.view.hasFocus()) this.view.focus()
          },
        },
      }),
    })

    return this.vm
  }

  dispatchInner(slotName, tr) {
    const { state, transactions } = this.vm.state.applyTransaction(tr)
    this.view.updateState(state)

    if (!tr.getMeta('fromOutside')) {
      const outerTr = this.view.state.tr
      const offsetMap = StepMap.offset(this.getPos() + 1)
      for (let i = 0; i < transactions.length; i += 1) {
        const { steps } = transactions[i]
        for (let j = 0; j < steps.length; j += 1) {
          outerTr.step(steps[j].map(offsetMap))
        }
      }
      if (outerTr.docChanged) this.view.dispatch(outerTr)
    }
  }
}
