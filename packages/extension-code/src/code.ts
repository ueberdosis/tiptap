import type { InputRuleMatch, PasteRuleMatch } from '@tiptap/core'
import { Mark, markInputRule, markPasteRule, mergeAttributes } from '@tiptap/core'

export interface CodeOptions {
  /**
   * The HTML attributes applied to the code element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    code: {
      /**
       * Set a code mark
       */
      setCode: () => ReturnType
      /**
       * Toggle inline code
       */
      toggleCode: () => ReturnType
      /**
       * Unset a code mark
       */
      unsetCode: () => ReturnType
    }
  }
}

/**
 * The regular expression used for the inline code input rule.
 * @deprecated The extension now uses a function-based finder internally.
 * This regex is kept for backward compatibility.
 */
export const inputRegex = /(^|[^`])`([^`]+)`(?!`)$/

/**
 * The regular expression used for the inline code paste rule.
 * @deprecated The extension now uses a function-based finder internally.
 * This regex is kept for backward compatibility.
 */
export const pasteRegex = /(^|[^`])`([^`]+)`(?!`)/g

/**
 * A function-based finder for the inline code input rule.
 * Used internally by the extension to ensure the preceding character
 * is not consumed as part of the match, preventing it from being deleted.
 */
export const inputRegexMatch = (text: string): InputRuleMatch | null => {
  const match = /`([^`]+)`(?!`)$/.exec(text)

  if (!match) {
    return null
  }

  // Ensure the opening backtick isn't preceded by another backtick
  if (match.index > 0 && text[match.index - 1] === '`') {
    return null
  }

  return {
    index: match.index,
    text: match[0],
    replaceWith: match[1],
  }
}

/**
 * A function-based finder for the inline code paste rule.
 * Used internally by the extension to avoid consuming the preceding
 * character as part of the match.
 */
export const pasteRegexMatch = (text: string): PasteRuleMatch[] => {
  const regex = /`([^`]+)`(?!`)/g
  const matches: PasteRuleMatch[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    // Ensure the opening backtick isn't preceded by another backtick
    if (match.index > 0 && text[match.index - 1] === '`') {
      continue
    }

    matches.push({
      index: match.index,
      text: match[0],
      replaceWith: match[1],
    })
  }

  return matches
}

/**
 * This extension allows you to mark text as inline code.
 * @see https://tiptap.dev/api/marks/code
 */
export const Code = Mark.create<CodeOptions>({
  name: 'code',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  excludes: '_',

  code: true,

  exitable: true,

  parseHTML() {
    return [{ tag: 'code' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['code', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  markdownTokenName: 'codespan',

  parseMarkdown: (token, helpers) => {
    // Convert 'codespan' token to code mark
    // For codespan tokens, we use the raw text content, not tokens
    return helpers.applyMark('code', [{ type: 'text', text: token.text || '' }])
  },

  renderMarkdown: (node, h) => {
    if (!node.content) {
      return ''
    }

    return `\`${h.renderChildren(node.content)}\``
  },

  addCommands() {
    return {
      setCode:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name)
        },
      toggleCode:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name)
        },
      unsetCode:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-e': () => this.editor.commands.toggleCode(),
    }
  },

  addInputRules() {
    return [
      markInputRule({
        find: inputRegexMatch,
        type: this.type,
      }),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegexMatch,
        type: this.type,
      }),
    ]
  },
})
