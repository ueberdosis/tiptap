import { Extension } from '@tiptap/vue-3'

// Shows stats at the end of the node that contains the current selection.
// Updates only when the selection moves to a different node or when that node's text actually changes.
export const SelectionIndicatorExtension = Extension.create({
  name: 'nodeStats',

  decorations: () => {
    function findContainingNode(doc, pos) {
      let found = null
      doc.descendants((node, nodePos) => {
        if (found) {
          return false
        }
        const start = nodePos
        const end = nodePos + node.nodeSize
        if (pos >= start && pos < end && (node.type.name === 'paragraph' || node.type.name === 'heading')) {
          found = { node, pos: nodePos }
          return false
        }
        return true
      })
      return found
    }

    function computeStats(text) {
      const trimmed = (text || '').trim()
      const length = trimmed.length
      const words = trimmed.length ? trimmed.split(/\s+/).filter(Boolean).length : 0
      const sentences = trimmed.length ? trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0
      const avgWordLength = words > 0 ? Math.round((trimmed.replace(/\s+/g, '').length / words) * 10) / 10 : 0
      return { length, words, sentences, avgWordLength }
    }

    return {
      create({ state }) {
        const decorations = []
        const selPos = state.selection.from
        const containing = findContainingNode(state.doc, selPos)
        if (!containing) {
          return decorations
        }

        const { node, pos } = containing
        const stats = computeStats(node.textContent)
        const display = `chars: ${stats.length} · words: ${stats.words} · sentences: ${stats.sentences} · avg word: ${stats.avgWordLength}`

        // place widget at the end of the node (after its content)
        const at = pos + node.nodeSize - 1

        // Return a raw widget item so we can include a `spec` with the current display string.
        decorations.push({
          type: 'widget',
          from: at,
          to: at,
          widget: () => {
            const wrapper = document.createElement('span')
            wrapper.className = 'node-stats-widget'
            wrapper.setAttribute('contenteditable', 'false')
            wrapper.setAttribute('aria-hidden', 'true')
            wrapper.style.display = 'inline-flex'
            wrapper.style.gap = '8px'
            wrapper.style.alignItems = 'center'
            wrapper.style.marginLeft = '8px'
            wrapper.style.opacity = '0.7'
            wrapper.style.fontSize = '12px'
            wrapper.style.pointerEvents = 'none'

            const badge = document.createElement('span')
            badge.className = 'node-stats-widget__badge'
            badge.textContent = display
            badge.style.background = 'rgba(99,102,241,0.08)'
            badge.style.color = '#374151'
            badge.style.padding = '4px 8px'
            badge.style.borderRadius = '6px'
            badge.style.border = '1px solid rgba(99,102,241,0.12)'

            wrapper.appendChild(badge)

            return wrapper
          },
          // attach dynamic data so the decoration diffing can detect changes
          spec: { display, name: 'node-stats-widget' },
        })

        return decorations
      },

      shouldUpdate: ({ oldState, newState, tr }) => {
        const oldSel = oldState.selection.from
        const newSel = newState.selection.from

        const oldNodeInfo = findContainingNode(oldState.doc, oldSel)
        const newNodeInfo = findContainingNode(newState.doc, newSel)

        // If one has a node and the other doesn't, update
        if (!!oldNodeInfo !== !!newNodeInfo) {
          return true
        }
        if (!oldNodeInfo && !newNodeInfo) {
          return false
        }

        // Map the old node position through the transaction mapping into the new document
        const mappedOldPos = tr.mapping ? tr.mapping.map(oldNodeInfo.pos) : oldNodeInfo.pos

        // If the mapped old position doesn't match the new node's position, selection moved to a different node
        if (mappedOldPos !== newNodeInfo.pos) {
          return true
        }

        // If doc didn't change, no update necessary
        if (!tr.docChanged) {
          return false
        }

        // As a pragmatic fallback: if the doc changed and the selection remained in the same node,
        // update the decoration so typing inside the node reflects immediately.
        return true
      },
    }
  },
})
