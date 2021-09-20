import { Plugin, PluginKey } from 'prosemirror-state'
import { Slice, Fragment, MarkType } from 'prosemirror-model'

type MarkPasteRuleMatch = {
  index: number,
  text: string,
  replaceWith?: string,
  match?: RegExpMatchArray,
  [key: string]: any,
}

const regexHandler = (text: string, regex: RegExp): MarkPasteRuleMatch[] => {
  return [...text.matchAll(regex)]
    .filter(match => match.index !== undefined)
    .map(match => {
      const fullMatch = Math.max(match.length - 3, 0)
      const outerMatch = Math.max(match.length - 2, 0)
      const innerMatch = Math.max(match.length - 1, 0)
      const prefixLength = match[fullMatch].lastIndexOf(match[outerMatch])
      const index = (match.index as number) + prefixLength

      return {
        index,
        text: match[outerMatch],
        replaceWith: match[innerMatch],
        match,
      }
    })
}

export default function markPasteRuleNew(config: {
  matcher: RegExp | ((text: string) => MarkPasteRuleMatch[]),
  type: MarkType,
  getAttributes?:
    | Record<string, any>
    | ((match: MarkPasteRuleMatch) => Record<string, any>)
    | false
    | null
  ,
}): Plugin {
  const { matcher, type, getAttributes } = config

  const handler = (fragment: Fragment, parent?: any): Fragment => {
    const nodes: any[] = []

    if (parent && !parent.type.allowsMarkType(type)) {
      return fragment
    }

    fragment.forEach(child => {
      if (!child.isText || !child.text) {
        nodes.push(child.copy(handler(child.content, child)))

        return
      }

      let pos = 0
      const { text } = child
      const matches = typeof matcher === 'function'
        ? matcher(text)
        : regexHandler(text, matcher)

      matches.forEach(match => {
        const attrs = getAttributes instanceof Function
          ? getAttributes(match)
          : getAttributes

        if (!attrs && attrs !== undefined) {
          return
        }

        // adding text before markdown to nodes
        if (match.index > 0) {
          nodes.push(child.cut(pos, match.index))
        }

        const { schema } = child.type
        const textNode = schema
          .text(match.replaceWith || match.text)
          .mark(type.create(attrs).addToSet(child.marks))

        nodes.push(textNode)

        pos = match.index + match.text.length
      })

      // adding rest of text to nodes
      if (pos < text.length) {
        nodes.push(child.cut(pos))
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
