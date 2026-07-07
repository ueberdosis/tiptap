import { Schema } from '@tiptap/pm/model'
import { EditorState, NodeSelection, TextSelection } from '@tiptap/pm/state'
import { DecorationSet } from '@tiptap/pm/view'
import { describe, expect, it } from 'vitest'

import type { DocViewLike } from '../ReactEditorView.js'
import { ReactEditorView } from '../ReactEditorView.js'
import {
  CHILD_DIRTY,
  CONTENT_DIRTY,
  NODE_DIRTY,
  NodeViewDesc,
  NOT_DIRTY,
  TextViewDesc,
} from '../viewdesc.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0],
    },
    text: { group: 'inline' },
  },
})

/**
 * Hand-builds DOM and a matching desc tree for:
 *
 *   doc(paragraph("foo"), paragraph("bar"))
 *   <div><p>foo</p><p>bar</p></div>
 *
 * Positions: p1 node at 0, "foo" spans 1-4, p2 node at 5, "bar" spans 6-9.
 */
const buildTree = () => {
  const doc = schema.node('doc', null, [
    schema.node('paragraph', null, [schema.text('foo')]),
    schema.node('paragraph', null, [schema.text('bar')]),
  ])

  const mount = document.createElement('div')
  const p1 = document.createElement('p')
  const t1 = document.createTextNode('foo')
  const p2 = document.createElement('p')
  const t2 = document.createTextNode('bar')

  p1.appendChild(t1)
  p2.appendChild(t2)
  mount.append(p1, p2)

  const none = DecorationSet.empty
  const docDesc = new NodeViewDesc(undefined, doc, [], none, mount, mount, mount)
  const p1Desc = new NodeViewDesc(docDesc, doc.child(0), [], none, p1, p1, p1)
  const t1Desc = new TextViewDesc(p1Desc, doc.child(0).child(0), [], none, t1, t1)
  const p2Desc = new NodeViewDesc(docDesc, doc.child(1), [], none, p2, p2, p2)
  const t2Desc = new TextViewDesc(p2Desc, doc.child(1).child(0), [], none, t2, t2)

  p1Desc.children.push(t1Desc)
  p2Desc.children.push(t2Desc)
  docDesc.children.push(p1Desc, p2Desc)

  return { doc, mount, p1, t1, p2, t2, docDesc, p1Desc, t1Desc, p2Desc, t2Desc }
}

/** A ReactEditorView whose docView is the hand-built desc tree. */
const buildView = () => {
  const tree = buildTree()
  const view = new ReactEditorView(document.createElement('div'), {
    state: EditorState.create({ doc: tree.doc }),
  })

  ;(view as unknown as { docView: DocViewLike }).docView = tree.docDesc as unknown as DocViewLike
  return { ...tree, view }
}

describe('viewdesc', () => {
  it('computes sizes, borders, and positions', () => {
    const { doc, docDesc, p1Desc, p2Desc, t1Desc, t2Desc } = buildTree()

    expect(docDesc.size).toBe(doc.nodeSize)
    expect(p1Desc.size).toBe(5)
    expect(t1Desc.size).toBe(3)
    expect(docDesc.border).toBe(1)
    expect(t1Desc.border).toBe(0)

    expect(docDesc.posAtStart).toBe(0)
    expect(p1Desc.posBefore).toBe(0)
    expect(p1Desc.posAtStart).toBe(1)
    expect(p1Desc.posAtEnd).toBe(4)
    expect(p2Desc.posBefore).toBe(5)
    expect(t2Desc.posAtStart).toBe(6)
    expect(t2Desc.posAfter).toBe(9)
  })

  it('maps positions to DOM through view.domAtPos', () => {
    const { view, mount, p1, t1, p2, t2 } = buildView()

    // Doc boundaries land in the doc's contentDOM
    expect(view.domAtPos(0)).toMatchObject({ node: mount, offset: 0 })
    expect(view.domAtPos(10)).toMatchObject({ node: mount, offset: 2 })

    // Paragraph start/middle/end; a nonzero side descends into the text
    // node, side 0 stays on the element boundary (prosemirror-view semantics)
    expect(view.domAtPos(1, 1)).toMatchObject({ node: t1, offset: 0 })
    expect(view.domAtPos(2)).toMatchObject({ node: t1, offset: 1 })
    expect(view.domAtPos(4)).toMatchObject({ node: p1, offset: 1 })
    expect(view.domAtPos(4, -1)).toMatchObject({ node: t1, offset: 3 })
    expect(view.domAtPos(6, 0)).toMatchObject({ node: p2, offset: 0 })
    expect(view.domAtPos(8)).toMatchObject({ node: t2, offset: 2 })
  })

  it('maps DOM to positions through view.posAtDOM', () => {
    const { view, mount, p1, t1, t2 } = buildView()

    // Text node offsets: start, middle, end
    expect(view.posAtDOM(t1, 0)).toBe(1)
    expect(view.posAtDOM(t1, 2)).toBe(3)
    expect(view.posAtDOM(t1, 3)).toBe(4)
    expect(view.posAtDOM(t2, 1)).toBe(7)

    // Element positions: between paragraphs, biased before/after
    expect(view.posAtDOM(mount, 1, -1)).toBe(5)
    expect(view.posAtDOM(mount, 1, 1)).toBe(5)
    expect(view.posAtDOM(mount, 0, 1)).toBe(0)
    expect(view.posAtDOM(p1, 0, 1)).toBe(1)
  })

  it('resolves nodes through view.nodeDOM', () => {
    const { view, p1, p2, t1 } = buildView()

    expect(view.nodeDOM(0)).toBe(p1)
    expect(view.nodeDOM(5)).toBe(p2)
    expect(view.nodeDOM(1)).toBe(t1)
    expect(view.nodeDOM(3)).toBeNull()
  })

  it('round-trips collapsed selections', () => {
    const { view, doc } = buildView()

    for (const pos of [1, 2, 4, 6, 8, 9]) {
      const selection = TextSelection.create(doc, pos)
      const { node, offset } = view.domAtPos(selection.head)
      const restored = TextSelection.create(doc, view.posAtDOM(node, offset))

      expect(restored.eq(selection)).toBe(true)
    }
  })

  it('round-trips range selections', () => {
    const { view, doc } = buildView()

    const cases: [number, number][] = [
      [1, 4], // within one paragraph
      [2, 8], // across paragraphs
      [6, 9], // full second paragraph text
    ]

    cases.forEach(([anchor, head]) => {
      const selection = TextSelection.create(doc, anchor, head)
      const anchorDOM = view.domAtPos(selection.anchor)
      const headDOM = view.domAtPos(selection.head)
      const restored = TextSelection.create(
        doc,
        view.posAtDOM(anchorDOM.node, anchorDOM.offset),
        view.posAtDOM(headDOM.node, headDOM.offset),
      )

      expect(restored.eq(selection)).toBe(true)
    })
  })

  it('round-trips node selections', () => {
    const { view, doc, docDesc, p2 } = buildView()

    const selection = NodeSelection.create(doc, 5)

    // Selection -> DOM: the element after the selection position
    const target = docDesc.domAfterPos(selection.from)
    expect(target).toBe(p2)

    // DOM -> selection: the desc registered on the element gives the position back
    const desc = target.pmViewDesc
    expect(desc).toBeDefined()
    const restored = NodeSelection.create(doc, desc!.posBefore)
    expect(restored.eq(selection)).toBe(true)

    // The same lookup through nearestDesc, as the base view's mouse handling does
    expect(view.posAtDOM(p2, 0, 1)).toBe(6)
    expect(docDesc.nearestDesc(p2, true)?.posBefore).toBe(5)
  })

  it('tracks dirty ranges', () => {
    const { docDesc, p1Desc, t1Desc, p2Desc } = buildTree()

    // A change inside "foo" dirties the chain down to the text
    docDesc.markDirty(2, 3)
    expect(docDesc.dirty).toBe(CHILD_DIRTY)
    expect(p1Desc.dirty).toBe(CHILD_DIRTY)
    expect(t1Desc.dirty).toBe(CONTENT_DIRTY)
    expect(p2Desc.dirty).toBe(NOT_DIRTY)
  })

  it('marks the whole node dirty when a change covers its boundary', () => {
    const { docDesc, p1Desc, p2Desc } = buildTree()

    docDesc.markDirty(0, 5)
    expect(p1Desc.dirty).toBe(NODE_DIRTY)
    expect(p2Desc.dirty).toBe(NOT_DIRTY)
    expect(docDesc.dirty).toBe(CONTENT_DIRTY)
  })

  it('marks only the root dirty for the commit-effects sentinel range', () => {
    const { docDesc, p1Desc, p2Desc } = buildTree()

    docDesc.markDirty(-1, -1)
    expect(docDesc.dirty).toBe(CONTENT_DIRTY)
    expect(p1Desc.dirty).toBe(NOT_DIRTY)
    expect(p2Desc.dirty).toBe(NOT_DIRTY)
  })

  it('propagates dirt to parents via markParentsDirty', () => {
    const { docDesc, p1Desc, t1Desc } = buildTree()

    t1Desc.markParentsDirty()
    expect(p1Desc.dirty).toBe(CONTENT_DIRTY)
    expect(docDesc.dirty).toBe(CHILD_DIRTY)
  })

  it('matches nodes only when clean and equal', () => {
    const { doc, docDesc, p1Desc } = buildTree()
    const none = DecorationSet.empty

    expect(docDesc.matchesNode(doc, [], none)).toBe(true)
    expect(p1Desc.matchesNode(doc.child(0), [], none)).toBe(true)
    expect(p1Desc.matchesNode(doc.child(1), [], none)).toBe(false)

    docDesc.markDirty(2, 3)
    expect(docDesc.matchesNode(doc, [], none)).toBe(false)
  })

  it('unregisters DOM expandos on destroy', () => {
    const { docDesc, mount, p1, t1 } = buildTree()

    expect(mount.pmViewDesc).toBe(docDesc)
    docDesc.destroy()
    expect(mount.pmViewDesc).toBeUndefined()
    expect(p1.pmViewDesc).toBeUndefined()
    expect(t1.pmViewDesc).toBeUndefined()
  })
})
