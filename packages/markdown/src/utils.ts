import MarkdownIt, { type StateCore, type Token as MDToken } from 'markdown-it'

const markdownIt = new MarkdownIt()

// use markdownIt to parse markdown content
// into tokens
export function tokenize(content: string): MDToken[] {
  return markdownIt.parse(content, {})
}

export const createInlineTokenPlugin =
  (options: {
    type: string
    tag: (match: RegExpMatchArray) => string
    regex: RegExp
    setAttributes: (token: MDToken, match: RegExpExecArray) => void
    renderText: (match: RegExpExecArray) => string
  }) =>
  (md: MarkdownIt) => {
    function tokenizer(state: StateCore) {
      const Token = state.Token
      for (let i = 0; i < state.tokens.length; i += 1) {
        const blockToken = state.tokens[i]

        // we want to not handle tokens that are not inline or do not have content
        if (blockToken.type !== 'inline' || !blockToken.content) {
          continue
        }

        const children: MDToken[] = []
        const text = blockToken.content
        let lastIndex = 0

        let match: RegExpExecArray | null

        // eslint-disable-next-line no-cond-assign
        while ((match = options.regex.exec(text)) !== null) {
          const [fullMatch] = match
          const matchStart = match.index

          // if the match starts after the last index, we need
          // to add the text before the match as a text token
          if (matchStart > lastIndex) {
            const textToken = new Token('text', '', 0)
            textToken.content = text.slice(lastIndex, matchStart)
            children.push(textToken)
          }

          const openToken = new Token(`${options.type}_open`, options.tag(match), 1)
          options.setAttributes(openToken, match)
          children.push(openToken)

          const contentToken = new Token('text', '', 0)
          contentToken.content = options.renderText(match)
          children.push(contentToken)

          const closeToken = new Token(`${options.type}_close`, options.tag(match), -1)
          children.push(closeToken)

          lastIndex = matchStart + fullMatch.length
        }

        if (lastIndex < text.length) {
          const textToken = new Token('text', '', 0)
          textToken.content = text.slice(lastIndex)
          children.push(textToken)
        }

        blockToken.children = children
      }

      return true
    }

    md.core.ruler.push(options.type, tokenizer)
  }

const createMarkdownPlugin = createInlineTokenPlugin({
  type: 'mention',
  tag: () => 'span',
  regex: /\[@([^\]]+)\]\((\d+)\)/g,
  setAttributes: (token, match) => {
    token.attrs = [
      ['class', 'mention'],
      ['data-mention-id', match[2]],
      ['data-mention-name', match[1]],
    ]
  },
  renderText: match => `@${match[1]}`,
})

const createHeadingPlugin = createInlineTokenPlugin({
  type: 'cool_heading',
  tag: match => {
    const [, levelChars] = match
    const level = levelChars.length
    return `h${level}`
  },
  regex: /^(#{1,6})\s+(.+)$/gm,
  setAttributes: (token, match) => {
    const [, levelChars, content] = match
    const level = levelChars.length
    token.attrs = [['class', `heading heading-${level}`]]
    token.content = content.trim()
  },
  renderText: match => match[2].trim(),
})

markdownIt.use(createMarkdownPlugin)
markdownIt.use(createHeadingPlugin)
