import { Plugin } from 'prosemirror-state'
import { Slice, Fragment, MarkType } from 'prosemirror-model'

export default function (regexp: RegExp, type: MarkType, getAttrs?: Function) {

  const handler = (fragment: Fragment, parent?: any) => {
    const nodes: any[] = []
    
    fragment.forEach(child => {
      if (child.isText && child.text) {
        const { text } = child
        let pos = 0
        let match
        
        // eslint-disable-next-line
        while ((match = regexp.exec(text)) !== null) {
          const m = match.length - 1

          if (parent.type.allowsMarkType(type) && match[1]) {
            const start = match.index
            const matchStart = start + match[0].indexOf(match[m - 1])
            const matchEnd = matchStart + match[m - 1].length // TODO: why is there no -1
            const textStart = matchStart + match[m - 1].lastIndexOf(match[m])
            const textEnd = textStart + match[m].length
            const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs

            // adding text before markdown to nodes
            if (matchStart > 0) {
              nodes.push(child.cut(pos, matchStart))
            }

            // adding the markdown part to nodes
            nodes.push(child
              .cut(textStart, textEnd)
              // @ts-ignore
              .mark(type.create(attrs).addToSet(child.marks)))

            pos = matchEnd
          }
        }

        // adding rest of text to nodes
        if (pos < text.length) {
          nodes.push(child.cut(pos))
        }
      } else {
        nodes.push(child.copy(handler(child.content, child)))
      }
    })

    return Fragment.fromArray(nodes)
  }

  return new Plugin({
    props: {
      transformPasted: slice => {
        return new Slice(handler(slice.content), slice.openStart, slice.openEnd)
      },
    },
  })

}
