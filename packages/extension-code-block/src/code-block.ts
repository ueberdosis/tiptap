import { mergeAttributes, Node, textblockTypeInputRule } from '@tiptap/core'
import { Plugin, PluginKey, Selection, TextSelection } from '@tiptap/pm/state'

const DEFAULT_TAB_SIZE = 4

export interface CodeBlockOptions {
  /**
   * Adds a prefix to language classes that are applied to code tags.
   * @default 'language-'
   */
  languageClassPrefix: string | null | undefined
  /**
   * Define whether the node should be exited on triple enter.
   * @default true
   */
  exitOnTripleEnter: boolean | null | undefined
  /**
   * Define whether the node should be exited on arrow down if there is no node after it.
   * @default true
   */
  exitOnArrowDown: boolean | null | undefined
  /**
   * The default language.
   * @default null
   * @example 'js'
   */
  defaultLanguage: string | null | undefined
  /**
   * Enable tab key for indentation in code blocks.
   * @default false
   */
  enableTabIndentation: boolean | null | undefined
  /**
   * The number of spaces to use for tab indentation.
   * @default 4
   */
  tabSize: number | null | undefined
  /**
   * Custom HTML attributes that should be added to the rendered HTML tag.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeBlock: {
      /**
       * Set a code block
       * @param attributes Code block attributes
       * @example editor.commands.setCodeBlock({ language: 'javascript' })
       */
      setCodeBlock: (attributes?: { language: string }) => ReturnType
      /**
       * Toggle a code block
       * @param attributes Code block attributes
       * @example editor.commands.toggleCodeBlock({ language: 'javascript' })
       */
      toggleCodeBlock: (attributes?: { language: string }) => ReturnType
    }
  }
}

/**
 * Matches a code block with backticks.
 */
export const backtickInputRegex = /^```([a-z]+)?[\s\n]$/

/**
 * Matches a code block with tildes.
 */
export const tildeInputRegex = /^~~~([a-z]+)?[\s\n]$/

/**
 * This extension allows you to create code blocks.
 * @see https://tiptap.dev/api/nodes/code-block
 */
export const CodeBlock = Node.create<CodeBlockOptions>({
  name: 'codeBlock',

  addOptions() {
    return {
      languageClassPrefix: 'language-',
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      defaultLanguage: null,
      enableTabIndentation: false,
      tabSize: DEFAULT_TAB_SIZE,
      HTMLAttributes: {},
    }
  },

  content: 'text*',

  marks: '',

  group: 'block',

  code: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: this.options.defaultLanguage,
        parseHTML: element => {
          const { languageClassPrefix } = this.options

          if (!languageClassPrefix) {
            return null
          }

          const classNames = [...(element.firstElementChild?.classList || [])]
          const languages = classNames
            .filter(className => className.startsWith(languageClassPrefix))
            .map(className => className.replace(languageClassPrefix, ''))
          const language = languages[0]

          if (!language) {
            return null
          }

          return language
        },
        rendered: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      [
        'code',
        {
          class: node.attrs.language ? this.options.languageClassPrefix + node.attrs.language : null,
        },
        0,
      ],
    ]
  },

  markdownTokenName: 'code',

  parseMarkdown: (token, helpers) => {
    if (token.raw?.startsWith('```') === false && token.codeBlockStyle !== 'indented') {
      return []
    }

    return helpers.createNode(
      'codeBlock',
      { language: token.lang || null },
      token.text ? [helpers.createTextNode(token.text)] : [],
    )
  },

  renderMarkdown: (node, h) => {
    let output = ''
    const language = node.attrs?.language || ''

    if (!node.content) {
      output = `\`\`\`${language}\n\n\`\`\``
    } else {
      const lines = [`\`\`\`${language}`, h.renderChildren(node.content), '```']
      output = lines.join('\n')
    }

    return output
  },

  addCommands() {
    return {
      setCodeBlock:
        attributes =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes)
        },
      toggleCodeBlock:
        attributes =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),

      // remove code block when at start of document or code block is empty
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection
        const isAtStart = $anchor.pos === 1

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false
        }

        if (isAtStart || !$anchor.parent.textContent.length) {
          return this.editor.commands.clearNodes()
        }

        return false
      },

      // handle tab indentation
      Tab: ({ editor }) => {
        if (!this.options.enableTabIndentation) {
          return false
        }

        const tabSize = this.options.tabSize ?? DEFAULT_TAB_SIZE
        const { state } = editor
        const { selection } = state
        const { $from, empty } = selection

        if ($from.parent.type !== this.type) {
          return false
        }

        const indent = ' '.repeat(tabSize)

        if (empty) {
          return editor.commands.insertContent(indent)
        }

        return editor.commands.command(({ tr }) => {
          const { from, to } = selection
          const text = state.doc.textBetween(from, to, '\n', '\n')
          const lines = text.split('\n')
          const indentedText = lines.map(line => indent + line).join('\n')

          tr.replaceWith(from, to, state.schema.text(indentedText))
          return true
        })
      },

      // handle shift+tab reverse indentation
      'Shift-Tab': ({ editor }) => {
        if (!this.options.enableTabIndentation) {
          return false
        }

        const tabSize = this.options.tabSize ?? DEFAULT_TAB_SIZE
        const { state } = editor
        const { selection } = state
        const { $from, empty } = selection

        if ($from.parent.type !== this.type) {
          return false
        }

        if (empty) {
          return editor.commands.command(({ tr }) => {
            const { pos } = $from
            const codeBlockStart = $from.start()
            const codeBlockEnd = $from.end()

            const allText = state.doc.textBetween(codeBlockStart, codeBlockEnd, '\n', '\n')
            const lines = allText.split('\n')

            let currentLineIndex = 0
            let charCount = 0
            const relativeCursorPos = pos - codeBlockStart

            for (let i = 0; i < lines.length; i += 1) {
              if (charCount + lines[i].length >= relativeCursorPos) {
                currentLineIndex = i
                break
              }
              charCount += lines[i].length + 1
            }

            const currentLine = lines[currentLineIndex]
            const leadingSpaces = currentLine.match(/^ */)?.[0] || ''
            const spacesToRemove = Math.min(leadingSpaces.length, tabSize)

            if (spacesToRemove === 0) {
              return true
            }

            let lineStartPos = codeBlockStart
            for (let i = 0; i < currentLineIndex; i += 1) {
              lineStartPos += lines[i].length + 1
            }

            tr.delete(lineStartPos, lineStartPos + spacesToRemove)

            const cursorPosInLine = pos - lineStartPos
            if (cursorPosInLine <= spacesToRemove) {
              tr.setSelection(TextSelection.create(tr.doc, lineStartPos))
            }

            return true
          })
        }

        return editor.commands.command(({ tr }) => {
          const { from, to } = selection
          const text = state.doc.textBetween(from, to, '\n', '\n')
          const lines = text.split('\n')
          const reverseIndentText = lines
            .map(line => {
              const leadingSpaces = line.match(/^ */)?.[0] || ''
              const spacesToRemove = Math.min(leadingSpaces.length, tabSize)
              return line.slice(spacesToRemove)
            })
            .join('\n')

          tr.replaceWith(from, to, state.schema.text(reverseIndentText))
          return true
        })
      },

      // exit node on triple enter
      Enter: ({ editor }) => {
        if (!this.options.exitOnTripleEnter) {
          return false
        }

        const { state } = editor
        const { selection } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2
        const endsWithDoubleNewline = $from.parent.textContent.endsWith('\n\n')

        if (!isAtEnd || !endsWithDoubleNewline) {
          return false
        }

        return editor
          .chain()
          .command(({ tr }) => {
            tr.delete($from.pos - 2, $from.pos)

            return true
          })
          .exitCode()
          .run()
      },

      // exit node on arrow down
      ArrowDown: ({ editor }) => {
        if (!this.options.exitOnArrowDown) {
          return false
        }

        const { state } = editor
        const { selection, doc } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2

        if (!isAtEnd) {
          return false
        }

        const after = $from.after()

        if (after === undefined) {
          return false
        }

        const nodeAfter = doc.nodeAt(after)

        if (nodeAfter) {
          return editor.commands.command(({ tr }) => {
            tr.setSelection(Selection.near(doc.resolve(after)))
            return true
          })
        }

        return editor.commands.exitCode()
      },
    }
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: backtickInputRegex,
        type: this.type,
        getAttributes: match => ({
          language: match[1],
        }),
      }),
      textblockTypeInputRule({
        find: tildeInputRegex,
        type: this.type,
        getAttributes: match => ({
          language: match[1],
        }),
      }),
    ]
  },

  addProseMirrorPlugins() {
    return [
      // this plugin creates a code block for pasted content from VS Code
      // we can also detect the copied code language
      new Plugin({
        key: new PluginKey('codeBlockVSCodeHandler'),
        props: {
          handlePaste: (view, event) => {
            if (!event.clipboardData) {
              return false
            }

            // don’t create a new code block within code blocks
            if (this.editor.isActive(this.type.name)) {
              return false
            }

            const text = event.clipboardData.getData('text/plain')
            const vscode = event.clipboardData.getData('vscode-editor-data')
            const vscodeData = vscode ? JSON.parse(vscode) : undefined
            const language = vscodeData?.mode

            if (!text || !language) {
              return false
            }

            const { tr, schema } = view.state

            // prepare a text node
            // strip carriage return chars from text pasted as code
            // see: https://github.com/ProseMirror/prosemirror-view/commit/a50a6bcceb4ce52ac8fcc6162488d8875613aacd
            const textNode = schema.text(text.replace(/\r\n?/g, '\n'))

            // create a code block with the text node
            // replace selection with the code block
            tr.replaceSelectionWith(this.type.create({ language }, textNode))

            if (tr.selection.$from.parent.type !== this.type) {
              // put cursor inside the newly created code block
              tr.setSelection(TextSelection.near(tr.doc.resolve(Math.max(0, tr.selection.from - 2))))
            }

            // store meta information
            // this is useful for other plugins that depends on the paste event
            // like the paste rule plugin
            tr.setMeta('paste', true)

            view.dispatch(tr)

            return true
          },
        },
      }),
    ]
  },
})
