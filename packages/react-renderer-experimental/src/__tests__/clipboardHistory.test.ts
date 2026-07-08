import { Extension, Mark as TiptapMark, Node as TiptapNode, mergeAttributes } from '@tiptap/core'
import { closeHistory, history, redo, undo } from '@tiptap/pm/history'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'
import { act, createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import type { NodeViewComponentProps } from '../components/NodeViewComponentProps.js'
import { useMergedRefs } from '../refs.js'
import { Counter, CounterExtension, renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

const BoldExtension = TiptapMark.create({
  name: 'bold',
  parseHTML: () => [{ tag: 'strong' }],
  renderHTML: () => ['strong', 0],
})

const HistoryExtension = Extension.create({
  name: 'testHistory',
  addProseMirrorPlugins: () => [history()],
})

const DraggableCard = TiptapNode.create({
  name: 'card',
  group: 'block',
  atom: true,
  draggable: true,
  parseHTML: () => [{ tag: 'test-card' }],
  renderHTML: ({ HTMLAttributes }) => ['test-card', mergeAttributes(HTMLAttributes)],
})

describe('clipboard', () => {
  it('copies marked multi-block selections as HTML and text', async () => {
    const { view } = await renderTiptapEditor('<p>one <strong>bold</strong></p><p>two</p>', [
      BoldExtension,
    ])

    // Everything: from inside "one" to inside "two"
    const selection = TextSelection.create(view.state.doc, 1, 14)
    const { dom, text } = view.serializeForClipboard(selection.content())

    expect(dom.innerHTML).toContain('<strong>bold</strong>')
    expect(dom.querySelectorAll('p')).toHaveLength(2)
    expect(text).toBe('one bold\n\ntwo')
  })

  it('pastes HTML through the real pipeline and React renders it', async () => {
    const { editor, view, dom } = await renderTiptapEditor('<p>start</p>', [BoldExtension])

    await act(async () => {
      editor.commands.setTextSelection(6)
      // Leading whitespace inside a pasted block is trimmed by the parser
      view.pasteHTML('<p>-and <strong>pasted</strong></p><p>second</p>')
    })

    expect(editor.state.doc.textContent).toBe('start-and pastedsecond')
    expect(dom.innerHTML).toContain('<strong>pasted</strong>')
    expect(dom.querySelectorAll('p')).toHaveLength(2)
  })

  it('pastes plain text with paragraph splits', async () => {
    const { editor, view, dom } = await renderTiptapEditor('<p>x</p>')

    await act(async () => {
      editor.commands.setTextSelection(2)
      view.pasteText('one\n\ntwo')
    })

    expect(dom.querySelectorAll('p')).toHaveLength(2)
    expect(editor.state.doc.child(0).textContent).toBe('xone')
    expect(editor.state.doc.child(1).textContent).toBe('two')
  })

  it('pastes into React node view content', async () => {
    const CustomParagraph = ({ children, ref, contentDOMRef }: NodeViewComponentProps) =>
      createElement('p', { ref: useMergedRefs(ref, contentDOMRef), className: 'custom' }, children)

    const { editor, view, dom } = await renderTiptapEditor('<p>inside</p>', [BoldExtension], {
      paragraph: CustomParagraph,
    })

    await act(async () => {
      editor.commands.setTextSelection(7)
      view.pasteHTML('<strong>!</strong>')
    })

    expect(dom.querySelector('p.custom')?.innerHTML).toBe('inside<strong>!</strong>')
  })
})

describe('drag', () => {
  it('serializes the dragged node and arms view.dragging on dragstart', async () => {
    const { editor, view, dom } = await renderTiptapEditor('<p>a</p><test-card></test-card>', [
      DraggableCard,
    ])

    const card = dom.querySelector('test-card') as HTMLElement

    expect(card).toBeTruthy()

    const dataTransfer = new DataTransfer()
    const event = new DragEvent('dragstart', { bubbles: true, cancelable: true })

    // happy-dom's DragEvent constructor does not wire dataTransfer from init
    Object.defineProperty(event, 'dataTransfer', { value: dataTransfer })
    await act(async () => {
      card.dispatchEvent(event)
    })

    // ProseMirror serialized the draggable node from the schema and armed
    // the drag state (the drop half needs browser layout — covered by e2e)
    expect(dataTransfer.getData('text/html')).toContain('test-card')
    expect(view.dragging).toBeTruthy()
    expect(view.dragging?.slice.content.firstChild?.type.name).toBe('card')
    expect(editor.state.doc.textContent).toBe('a')
  })
})

describe('history depth', () => {
  it('walks content and selection back and forward through multiple steps', async () => {
    const { view, dom } = await renderTiptapEditor('<p>base</p>', [HistoryExtension])

    const steps = ['-one', '-two', '-three']

    for (const step of steps) {
      // Type-like edits: the cursor moves in its own transaction (like a
      // click) so history records it as the step's prior selection; then
      // closeHistory keeps each insert its own undo step (rapid edits
      // would otherwise merge within newGroupDelay)
      await act(async () => {
        view.dispatch(
          view.state.tr.setSelection(
            TextSelection.create(view.state.doc, view.state.doc.content.size - 1),
          ),
        )
      })
      await act(async () => {
        view.dispatch(closeHistory(view.state.tr.insertText(step)))
      })
    }
    expect(dom.querySelector('p')?.textContent).toBe('base-one-two-three')

    const contentsBackward = ['base-one-two', 'base-one', 'base']

    for (const expected of contentsBackward) {
      await act(async () => {
        undo(view.state, view.dispatch)
      })
      expect(dom.querySelector('p')?.textContent).toBe(expected)
      // History restores the selection of the undone step
      expect(view.state.selection.from).toBe(expected.length + 1)
    }

    for (const expected of ['base-one', 'base-one-two', 'base-one-two-three']) {
      await act(async () => {
        redo(view.state, view.dispatch)
      })
      expect(dom.querySelector('p')?.textContent).toBe(expected)
    }
  })

  it('undoes node view attribute changes without remounting', async () => {
    const { view, dom } = await renderTiptapEditor(
      '<test-counter count="1"></test-counter>',
      [CounterExtension, HistoryExtension],
      { counter: Counter },
    )

    const host = dom.querySelector('.counter') as HTMLElement

    await act(async () => {
      view.dispatch(view.state.tr.setNodeAttribute(0, 'count', 2))
    })
    expect(host.textContent).toBe('count-2')

    await act(async () => {
      undo(view.state, view.dispatch)
    })
    expect(host.textContent).toBe('count-1')
    expect(dom.querySelector('.counter')).toBe(host)

    await act(async () => {
      redo(view.state, view.dispatch)
    })
    expect(host.textContent).toBe('count-2')
    expect(dom.querySelector('.counter')).toBe(host)
  })
})

describe('selection bookmarks', () => {
  it('resolve correctly after React commits move the content', async () => {
    const { view } = await renderTiptapEditor('<p>alpha</p><p>beta</p>')

    // Bookmark a range in "beta" (positions 8-12: "beta" spans 8-12)
    const bookmark = TextSelection.create(view.state.doc, 8, 12).getBookmark()

    // Apply and commit a transaction inserting before the bookmarked range
    const tr = view.state.tr.insertText('XX', 1)

    await act(async () => {
      view.dispatch(tr)
    })

    // The mapped bookmark resolves on the committed doc, shifted by 2
    const restored = bookmark.map(tr.mapping).resolve(view.state.doc)

    expect(restored.from).toBe(10)
    expect(restored.to).toBe(14)
    expect(view.state.doc.textBetween(restored.from, restored.to)).toBe('beta')

    // ...and the committed DOM agrees with the resolved positions
    const headDOM = view.domAtPos(restored.to, -1)

    expect(view.posAtDOM(headDOM.node, headDOM.offset, -1)).toBe(14)
    expect(headDOM.node.nodeValue).toBe('beta')
  })

  it('resolves node selection bookmarks across commits', async () => {
    const { view, dom } = await renderTiptapEditor('<p>a</p><test-card></test-card>', [
      DraggableCard,
    ])

    // The card sits at position 3 (paragraph "a" spans 0-3)
    const bookmark = NodeSelection.create(view.state.doc, 3).getBookmark()
    const tr = view.state.tr.insertText('bb', 1)

    await act(async () => {
      view.dispatch(tr)
    })

    const restored = bookmark.map(tr.mapping).resolve(view.state.doc)

    expect(restored instanceof NodeSelection).toBe(true)
    expect((restored as NodeSelection).node.type.name).toBe('card')
    // The desc tree agrees: the selected node's DOM is the rendered card
    expect(view.nodeDOM(restored.from)).toBe(dom.querySelector('test-card'))
  })
})
