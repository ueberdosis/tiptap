import { Extension } from '@tiptap/vue-3'

/**
 * Block Readability Scoring - Node Decoration Example
 * Analyzes each paragraph and adds a readability score class.
 * Colors: green (easy), yellow (medium), red (hard)
 * This demonstrates how node decorations can analyze and categorize blocks.
 */

// Simple readability heuristics
function calculateReadabilityScore(text) {
  if (!text || text.trim().length === 0) {
    return 'empty'
  }

  const words = text.trim().split(/\s+/).length
  const characters = text.replace(/\s/g, '').length
  const avgWordLength = characters / words

  // Easy: reasonable length with acceptable word length
  if (words <= 20 && avgWordLength <= 6) {
    return 'easy'
  }
  if (words <= 35) {
    return 'medium'
  }

  // Hard: long text
  return 'hard'
}

export const ReadabilityScoringExtension = Extension.create({
  name: 'readabilityScoring',

  decorations: () => {
    return {
      create({ state }) {
        const decorations = []

        state.doc.descendants((node, pos) => {
          // Only apply to paragraphs and headings
          if (node.type.name === 'paragraph' || node.type.name === 'heading') {
            const score = calculateReadabilityScore(node.textContent)

            // Return a raw node decoration item with a small `spec` so the decoration
            // diffing can detect changes to the readability score immediately.
            const item = {
              type: 'node',
              from: pos,
              to: pos + node.nodeSize,
              attributes: {
                class: `readability-${score}`,
                'data-readability': score,
              },
              spec: { readability: score },
            }

            decorations.push(item)
          }
        })

        return decorations
      },

      shouldUpdate: ({ tr }) => {
        return tr.docChanged
      },
    }
  },
})
