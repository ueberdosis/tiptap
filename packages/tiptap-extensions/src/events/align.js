import { Decoration, DecorationSet } from 'prosemirror-view'

function getSelectionObject ({ $anchor, $head }) {
  return {
    from: $anchor.pos <= $head.pos ? $anchor.parent : $head.parent,
    to: $head.pos > $anchor.pos ? $head.parent : $anchor.parent,
    fromFound: false,
    toFound: false
  }
}

export default function align ({ doc, selection }, decorations = []) {
  let { from, to, fromFound, toFound } = getSelectionObject(selection)
  doc.descendants((node, pos) => {
    if (!node.isInline && (node === from || (fromFound && !toFound))) {
      decorations.push(
      	Decoration.node(pos, pos + node.nodeSize, {
      		class: 'SANDWICH',
      	}))
      fromFound = true
    }
    toFound = toFound || (from === to || node === to)
  })
  console.log(decorations)
  DecorationSet.create(doc, decorations)
}
