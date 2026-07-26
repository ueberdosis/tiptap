import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import { isNodeRangeSelection, NodeRangeSelection } from '@tiptap/extension-node-range'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { TextSelection } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vitest'

import {
  createDroppedNodeRangeSelection,
  getActiveDragRange,
  mapPendingRestoreAnchor,
} from '../src/helpers/nodeRangeDrop.js'

describe('nodeRangeDrop helpers', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
  })

  function createEditor(content: string): Editor {
    editor = new Editor({
      element: document.body,
      extensions: [Document, Paragraph, Text],
      content,
    })

    return editor
  }

  describe('getActiveDragRange', () => {
    it('captures the node count and depth of a node range selection', () => {
      const { state } = createEditor('<p>First</p><p>Second</p><p>Third</p>')
      const firstSize = state.doc.child(0).nodeSize
      const selection = NodeRangeSelection.create(state.doc, 1, firstSize + 1, 0)

      expect(getActiveDragRange(selection)).toEqual({
        anchorPos: selection.anchor,
        nodeCount: selection.ranges.length,
        depth: 0,
      })
    })

    it('returns null for a non node range selection', () => {
      const { state } = createEditor('<p>First</p>')
      const selection = TextSelection.create(state.doc, 1)

      expect(getActiveDragRange(selection)).toBeNull()
    })
  })

  describe('createDroppedNodeRangeSelection', () => {
    it('rebuilds a node range over the first two blocks', () => {
      const { state } = createEditor('<p>First</p><p>Second</p><p>Third</p>')
      const firstSize = state.doc.child(0).nodeSize
      const secondSize = state.doc.child(1).nodeSize

      const selection = createDroppedNodeRangeSelection(state.doc, 1, 2, 0)

      expect(selection && isNodeRangeSelection(selection)).toBe(true)
      expect(selection?.ranges).toHaveLength(2)
      expect(selection?.from).toBe(0)
      expect(selection?.to).toBe(firstSize + secondSize)
    })

    it('selects the blocks following the drop position', () => {
      const { state } = createEditor('<p>First</p><p>Second</p><p>Third</p>')
      const firstSize = state.doc.child(0).nodeSize

      const selection = createDroppedNodeRangeSelection(state.doc, firstSize + 1, 2, 0)

      expect(selection?.from).toBe(firstSize)
      expect(selection?.to).toBe(state.doc.content.size)
    })

    it('clamps to the last blocks when the drop lands past the end', () => {
      const { state } = createEditor('<p>First</p><p>Second</p><p>Third</p>')
      const firstSize = state.doc.child(0).nodeSize

      const selection = createDroppedNodeRangeSelection(state.doc, state.doc.content.size, 2, 0)

      expect(selection?.from).toBe(firstSize)
      expect(selection?.to).toBe(state.doc.content.size)
    })

    it('rebuilds a single-block range', () => {
      const { state } = createEditor('<p>First</p><p>Second</p>')
      const firstSize = state.doc.child(0).nodeSize

      const selection = createDroppedNodeRangeSelection(state.doc, 1, 1, 0)

      expect(selection?.ranges).toHaveLength(1)
      expect(selection?.from).toBe(0)
      expect(selection?.to).toBe(firstSize)
    })

    it('returns null when fewer blocks are available than were dragged', () => {
      const { state } = createEditor('<p>Only</p>')

      const selection = createDroppedNodeRangeSelection(state.doc, 1, 2, 0)

      expect(selection).toBeNull()
    })
  })

  describe('mapPendingRestoreAnchor', () => {
    it('remaps via Yjs relative positions on isChangeOrigin transactions', () => {
      const pendingRestore = {
        anchorPos: 10,
        nodeCount: 2,
        depth: 0,
        relativeAnchorPos: { type: 'mock' },
      }

      const tr = {
        docChanged: true,
        mapping: {
          mapResult: () => ({ deleted: true, pos: 0 }),
        },
      }

      const mapped = mapPendingRestoreAnchor(pendingRestore, tr, {
        isChangeOrigin: true,
        getAbsolutePos: () => 14,
      })

      expect(mapped).toEqual({
        ...pendingRestore,
        anchorPos: 14,
      })
    })

    it('clears the restore when the relative anchor cannot be resolved', () => {
      const pendingRestore = {
        anchorPos: 10,
        nodeCount: 2,
        depth: 0,
        relativeAnchorPos: { type: 'mock' },
      }

      const tr = {
        docChanged: true,
        mapping: {
          mapResult: () => ({ deleted: false, pos: 10 }),
        },
      }

      const mapped = mapPendingRestoreAnchor(pendingRestore, tr, {
        isChangeOrigin: true,
        getAbsolutePos: () => -1,
      })

      expect(mapped).toBeNull()
    })

    it('clears the restore when getAbsolutePos returns 0 (unresolved Yjs anchor)', () => {
      const pendingRestore = {
        anchorPos: 10,
        nodeCount: 2,
        depth: 0,
        relativeAnchorPos: { type: 'mock' },
      }

      const tr = {
        docChanged: true,
        mapping: {
          mapResult: () => ({ deleted: false, pos: 10 }),
        },
      }

      const mapped = mapPendingRestoreAnchor(pendingRestore, tr, {
        isChangeOrigin: true,
        getAbsolutePos: () => 0,
      })

      expect(mapped).toBeNull()
    })

    it('falls back to ProseMirror mapping for local transactions', () => {
      const pendingRestore = {
        anchorPos: 10,
        nodeCount: 2,
        depth: 0,
      }

      const tr = {
        docChanged: true,
        mapping: {
          mapResult: () => ({ deleted: false, pos: 12 }),
        },
      }

      const mapped = mapPendingRestoreAnchor(pendingRestore, tr, {
        isChangeOrigin: false,
        getAbsolutePos: () => -1,
      })

      expect(mapped).toEqual({
        ...pendingRestore,
        anchorPos: 12,
      })
    })
  })
})
