import { defaultKeymap } from '@codemirror/commands'
import {
  EditorState as CodeMirrorEditorState,
  Extension as CodeMirrorExtension,
  Prec,
  Transaction as CodeMirrorTransaction,
} from '@codemirror/state'
import {
  Command as CodeMirrorCommand,
  EditorView as CodeMirrorEditorView,
  KeyBinding as CodeMirrorKeyBinding,
  keymap,
} from '@codemirror/view'

import { exitCode } from 'prosemirror-commands'
import { Selection, TextSelection } from 'prosemirror-state'
import { EditorView, NodeView } from 'prosemirror-view'
import { Schema, Node as ProsemirrorNode } from 'prosemirror-model'

/**
 * Compare two strings and find the minimal change between them
 *
 * It iterates from the start and end of the strings, until it hits a difference, and returns an object
 * giving the change's start, end, and replacement text, or null if there was no change.
 */
function computeChange(
  oldVal: string,
  newVal: string,
): { from: number; to: number; text: string } | null {
  if (oldVal === newVal) {
    return null
  }

  let start = 0
  let oldEnd = oldVal.length
  let newEnd = newVal.length

  while (start < oldEnd && oldVal.charCodeAt(start) === newVal.charCodeAt(start)) {
    start += 1
  }

  while (
    oldEnd > start
    && newEnd > start
    && oldVal.charCodeAt(oldEnd - 1) === newVal.charCodeAt(newEnd - 1)
  ) {
    oldEnd -= 1
    newEnd -= 1
  }

  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) }
}

export class CodeMirror6NodeView implements NodeView {
  public dom: HTMLElement

  private node: ProsemirrorNode

  private readonly view: EditorView

  private readonly getPos: () => number

  private schema: Schema

  private readonly cm: CodeMirrorEditorView

  private updating = false

  constructor({
    node,
    view,
    getPos,
    extensions,
  }: {
    node: ProsemirrorNode;
    view: EditorView;
    getPos: () => number;
    extensions?: CodeMirrorExtension[];
  }) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.schema = node.type.schema

    const changeFilter = CodeMirrorEditorState.changeFilter.of(tr => {
      if (!tr.docChanged && !this.updating) {
        this.forwardSelection()
      }

      return true
    })

    // Create the initial CodeMirror state
    const startState = CodeMirrorEditorState.create({
      doc: this.node.textContent,
      extensions: [
        keymap.of(defaultKeymap),
        // We give the following keymap a higher precedence so that it can
        // override the default `ArrowUp` and `ArrowDown` keymaps
        Prec.high(keymap.of(this.codeMirrorKeymap())),
        changeFilter,
        ...(extensions ?? []),
      ],
    })

    // Create a CodeMirror instance
    this.cm = new CodeMirrorEditorView({
      state: startState,
      dispatch: this.valueChanged.bind(this),
    })

    // The editor's outer node is our DOM representation
    this.dom = this.cm.dom
  }

  update(node: ProsemirrorNode): boolean {
    if (node.type !== this.node.type) {
      return false
    }

    this.node = node
    const change = computeChange(this.cm.state.doc.toString(), node.textContent)

    if (change) {
      this.updating = true
      this.cm.dispatch({
        changes: { from: change.from, to: change.to, insert: change.text },
      })
      this.updating = false
    }

    return true
  }

  /**
   * Synchronize the selections from ProseMirror to CodeMirrror
   */
  setSelection(anchor: number, head: number): void {
    this.cm.focus()
    this.updating = true
    this.cm.dispatch({ selection: { anchor, head } })
    this.updating = false
  }

  selectNode(): void {
    this.focus()
  }

  focus(): void {
    this.cm.focus()
    this.forwardSelection()
  }

  stopEvent(): boolean {
    return true
  }

  destroy(): void {
    this.cm.destroy()
  }

  /**
   * When the code editor is focused, we can keep the selection of the outer
   * editor synchronized with the inner one, so that any commands executed on
   * the outer editor see an accurate selection.
   */
  private forwardSelection() {
    if (!this.cm.hasFocus) {
      return
    }

    const state = this.view.state
    const selection = this.asProseMirrorSelection(state.doc)

    if (!selection.eq(state.selection)) {
      this.view.dispatch(state.tr.setSelection(selection))
    }
  }

  /**
   * This helper function translates from a CodeMirror selection to a
   * ProseMirror selection.
   */
  private asProseMirrorSelection(doc: ProsemirrorNode) {
    const start = this.getPos() + 1
    const { anchor, head } = this.cm.state.selection.main
    return TextSelection.create(doc, anchor + start, head + start)
  }

  /**
   * A somewhat tricky aspect of nesting editor like this is handling cursor
   * motion across the edges of the inner editor. This node view will have to
   * take care of allowing the user to move the selection out of the code
   * editor. For that purpose, it binds the arrow keys to handlers that check if
   * further motion would ‘escape’ the editor, and if so, return the selection
   * and focus to the outer editor.
   *
   * The keymap also binds ctrl-enter, which, in ProseMirror's base keymap,
   * creates a  new paragraph after a code block.
   */
  private codeMirrorKeymap(): CodeMirrorKeyBinding[] {
    return [
      {
        key: 'ArrowUp',
        run: this.maybeEscape('line', -1),
      },
      {
        key: 'ArrowLeft',
        run: this.maybeEscape('char', -1),
      },
      {
        key: 'ArrowDown',
        run: this.maybeEscape('line', 1),
      },
      {
        key: 'ArrowRight',
        run: this.maybeEscape('char', 1),
      },
      {
        key: 'Ctrl-Enter',
        run: () => {
          if (exitCode(this.view.state, this.view.dispatch)) {
            this.view.focus()
            return true
          }

          return false
        },
      },
    ]
  }

  /**
   * When the actual content of the code editor is changed, the event handler
   * registered in the node view's constructor calls this method. It'll compare
   * the code block node's current value to the value in the editor, and
   * dispatch a transaction if there is a difference.
   */
  private valueChanged(tr: CodeMirrorTransaction): void {
    this.cm.update([tr])

    if (!tr.docChanged || this.updating) {
      return
    }

    const change = computeChange(this.node.textContent, tr.state.doc.toString())

    if (change) {
      const start = this.getPos() + 1
      const pmTr = this.view.state.tr.replaceWith(
        start + change.from,
        start + change.to,
        change.text ? this.schema.text(change.text) : [],
      )
      this.view.dispatch(pmTr)
    }
  }

  private maybeEscape(unit: 'line' | 'char', dir: 1 | -1): CodeMirrorCommand {
    return (view: CodeMirrorEditorView) => {
      const { state } = view

      // Exit if the selection is not empty
      if (state.selection.ranges.some(range => !range.empty)) {
        return false
      }

      const anchor = state.selection.main.anchor
      const line = state.doc.lineAt(anchor)
      const lineOffset = anchor - line.from

      if (
        line.number !== (dir < 0 ? 1 : state.doc.lines)
        || (unit === 'char' && lineOffset !== (dir < 0 ? 0 : line.length))
      ) {
        return false
      }

      const targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize)
      const selection = Selection.near(this.view.state.doc.resolve(targetPos), dir)
      this.view.dispatch(this.view.state.tr.setSelection(selection).scrollIntoView())
      this.view.focus()
      return true
    }
  }
}
