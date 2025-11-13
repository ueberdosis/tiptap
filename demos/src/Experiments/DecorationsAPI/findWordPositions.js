export function findWordPositions(word, state) {
  const positions = []

  state.doc.descendants((node, pos) => {
    if (node.isText && node.text.toLowerCase().includes(word)) {
      // find all occurrences of the word “example”, don't stop after the first
      for (let i = 0; i < node.text.length; i += 1) {
        if (node.text.toLowerCase().slice(i).startsWith(word.toLowerCase())) {
          positions.push({ from: pos + i, to: pos + i + word.length })
        }
      }
    }
  })

  return positions
}
