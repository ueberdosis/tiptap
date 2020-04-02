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
          if (parent.type.allowsMarkType(type) && match[1]) {
            const start = match.index
            const end = start + match[0].length
            const textStart = start + match[0].indexOf(match[1])
            const textEnd = textStart + match[1].length
            const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs

            // adding text before markdown to nodes
            if (start > 0) {
              nodes.push(child.cut(pos, start))
            }

            // adding the markdown part to nodes
            nodes.push(child
              .cut(textStart, textEnd)
              // @ts-ignore
              .mark(type.create(attrs).addToSet(child.marks)))

            pos = end
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
        console.log({slice})
        return new Slice(handler(slice.content), slice.openStart, slice.openEnd)
      },
    },
  })

}
