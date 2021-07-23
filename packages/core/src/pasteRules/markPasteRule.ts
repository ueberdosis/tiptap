import { Plugin, PluginKey } from 'prosemirror-state'
import { Slice, Fragment, MarkType } from 'prosemirror-model'

export default function (
  regexp: RegExp,
  type: MarkType,
  getAttributes?: Record<string, any> | ((match: RegExpExecArray) => Record<string, any>),
): Plugin {
  const handler = (fragment: Fragment, parent?: any) => {
    const nodes: any[] = []

    fragment.forEach(child => {
      if (child.isText && child.text) {
        const { text } = child
        let pos = 0
        let match

        // eslint-disable-next-line
        while ((match = regexp.exec(text)) !== null) {
          const outerMatch = Math.max(match.length - 2, 0)
          const innerMatch = Math.max(match.length - 1, 0)

          if (parent?.type.allowsMarkType(type)) {
            const start = match.index
            const matchStart = start + match[0].indexOf(match[outerMatch])
            const matchEnd = matchStart + match[outerMatch].length
            const textStart = matchStart + match[outerMatch].lastIndexOf(match[innerMatch])
            const textEnd = textStart + match[innerMatch].length
            const attrs = getAttributes instanceof Function
              ? getAttributes(match)
              : getAttributes
            
            if (!attrs) {
              continue;
            }

            // adding text before markdown to nodes
            if (matchStart > 0) {
              nodes.push(child.cut(pos, matchStart))
            }

            // adding the markdown part to nodes
            nodes.push(child
              .cut(textStart, textEnd)
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
    key: new PluginKey('markPasteRule'),
    props: {
      transformPasted: slice => {
        return new Slice(handler(slice.content), slice.openStart, slice.openEnd)
      },
    },
  })
}
