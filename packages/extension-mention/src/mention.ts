import { mergeAttributes, Node } from '@tiptap/core'
import type { DOMOutputSpec, Node as ProseMirrorNode } from '@tiptap/pm/model'
import { PluginKey } from '@tiptap/pm/state'
import type { SuggestionOptions } from '@tiptap/suggestion'
import Suggestion from '@tiptap/suggestion'

// See `addAttributes` below
export interface MentionNodeAttrs {
  /**
   * The identifier for the selected item that was mentioned, stored as a `data-id`
   * attribute.
   */
  id: string | null
  /**
   * The label to be rendered by the editor as the displayed text for this mentioned
   * item, if provided. Stored as a `data-label` attribute. See `renderLabel`.
   */
  label?: string | null
  /**
   * The type of the mention, stored as a `data-type` attribute.
   * This is useful when using multiple suggestion configurations.
   */
  type?: string | null
  /**
   * The index of the suggestion configuration used for this mention, stored as a
   * `data-mention-suggestion-index` attribute.
   */
  mentionSuggestionIndex?: number
}

export type MentionOptions<SuggestionItem = any, Attrs extends Record<string, any> = MentionNodeAttrs> = {
  /**
   * The HTML attributes for a mention node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * A function to render the label of a mention.
   * @deprecated use renderText and renderHTML instead
   * @param props The render props
   * @returns The label
   * @example ({ options, node }) => `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
   */
  renderLabel?: (props: {
    options: MentionOptions<SuggestionItem, Attrs>
    node: ProseMirrorNode
    suggestion?: SuggestionOptions
  }) => string

  /**
   * A function to render the text of a mention.
   * @param props The render props
   * @returns The text
   * @example ({ options, node }) => `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
   */
  renderText: (props: {
    options: MentionOptions<SuggestionItem, Attrs>
    node: ProseMirrorNode
    suggestion?: SuggestionOptions
  }) => string

  /**
   * A function to render the HTML of a mention.
   * @param props The render props
   * @returns The HTML as a ProseMirror DOM Output Spec
   * @example ({ options, node }) => ['span', { 'data-type': 'mention' }, `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`]
   */
  renderHTML: (props: {
    options: MentionOptions<SuggestionItem, Attrs>
    node: ProseMirrorNode
    suggestion?: SuggestionOptions
  }) => DOMOutputSpec

  /**
   * Whether to delete the trigger character with backspace.
   * @default false
   */
  deleteTriggerWithBackspace: boolean

  /**
   * The suggestion options.
   * @default [{ char: '@', pluginKey: MentionPluginKey }]
   * @example [{ char: '@', pluginKey: MentionPluginKey }, { char: '#', pluginKey: new PluginKey('hashtag') }]
   */
  suggestions: Array<Omit<SuggestionOptions<SuggestionItem, Attrs>, 'editor'>>

  /**
   * The suggestion options.
   * @default {}
   * @example { char: '@', pluginKey: MentionPluginKey, command: ({ editor, range, props }) => { ... } }
   */
  suggestion: Omit<SuggestionOptions<SuggestionItem, Attrs>, 'editor'>
}

interface MentionStorage {
  suggestions: Array<SuggestionOptions>
}

function getDefaultSuggestionAttributes(extensionName: string, index: number) {
  const MentionPluginKey = new PluginKey()

  const defaultSuggestion = {
    char: '@',
    pluginKey: MentionPluginKey,
    command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
      // increase range.to by one when the next node is of type "text"
      // and starts with a space character
      const nodeAfter = editor.view.state.selection.$to.nodeAfter
      const overrideSpace = nodeAfter?.text?.startsWith(' ')

      if (overrideSpace) {
        range.to += 1
      }

      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: extensionName,
            attrs: { ...props, mentionSuggestionIndex: index },
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run()

      // get reference to `window` object from editor element, to support cross-frame JS usage
      editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd()
    },
    allow: ({ state, range }: { state: any; range: any }) => {
      const $from = state.doc.resolve(range.from)
      const type = state.schema.nodes[extensionName]
      const allow = !!$from.parent.type.contentMatch.matchType(type)

      return allow
    },
  }
  return defaultSuggestion
}
/**
 * This extension allows you to insert mentions into the editor.
 * @see https://www.tiptap.dev/api/extensions/mention
 */
export const Mention = Node.create<MentionOptions, MentionStorage>({
  name: 'mention',

  priority: 101,

  addStorage() {
    return {
      suggestions: [],
    }
  },

  addOptions() {
    return {
      HTMLAttributes: {},
      renderText({ node, suggestion }) {
        return `${suggestion?.char}${node.attrs.label ?? node.attrs.id}`
      },
      deleteTriggerWithBackspace: false,
      renderHTML({ options, node, suggestion }) {
        return [
          'span',
          mergeAttributes(this.HTMLAttributes, options.HTMLAttributes),
          `${suggestion?.char}${node.attrs.label ?? node.attrs.id}`,
        ]
      },
      suggestions: [],
      suggestion: {},
    }
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }

          return {
            'data-id': attributes.id,
          }
        },
      },

      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: attributes => {
          if (!attributes.label) {
            return {}
          }

          return {
            'data-label': attributes.label,
          }
        },
      },

      type: {
        default: null,
        parseHTML: element => element.getAttribute('data-type-name'),
        renderHTML: attributes => {
          if (!attributes.type) {
            return {}
          }

          return {
            'data-type-name': attributes.type,
            'data-type': attributes.type,
          }
        },
      },

      mentionSuggestionIndex: {
        default: 0,
        parseHTML: element => {
          const index = element.getAttribute('data-mention-suggestion-index')
          return index ? parseInt(index, 10) : 0
        },
        renderHTML: attributes => {
          return {
            'data-mention-suggestion-index': attributes.mentionSuggestionIndex,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    // Get the suggestion index from the node attributes
    const suggestionIndex = node.attrs.mentionSuggestionIndex || 0

    const suggestion = (this.editor?.extensionStorage as Record<string, any>)[this.name]?.suggestions[suggestionIndex]

    if (this.options.renderLabel !== undefined) {
      console.warn('renderLabel is deprecated use renderText and renderHTML instead')
      return [
        'span',
        mergeAttributes({ 'data-type': this.name }, this.options.HTMLAttributes, HTMLAttributes),
        this.options.renderLabel({
          options: this.options,
          node,
          suggestion,
        }),
      ]
    }
    const mergedOptions = { ...this.options }

    mergedOptions.HTMLAttributes = mergeAttributes(
      { 'data-type': this.name },
      this.options.HTMLAttributes,
      HTMLAttributes,
    )

    const html = this.options.renderHTML({
      options: mergedOptions,
      node,
      suggestion,
    })

    if (typeof html === 'string') {
      return ['span', mergeAttributes({ 'data-type': this.name }, this.options.HTMLAttributes, HTMLAttributes), html]
    }
    return html
  },

  renderText({ node }) {
    const suggestionIndex = node.attrs.mentionSuggestionIndex || 0
    const args = {
      options: this.options,
      node,
      suggestion: this.storage.suggestions[suggestionIndex],
    }
    if (this.options.renderLabel !== undefined) {
      console.warn('renderLabel is deprecated use renderText and renderHTML instead')
      return this.options.renderLabel(args)
    }

    return this.options.renderText(args)
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isMention = false
          const { selection } = state
          const { empty, anchor } = selection

          if (!empty) {
            return false
          }

          // Store node and position for later use
          let mentionNode: any = null
          let mentionPos = 0

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isMention = true
              mentionNode = node
              mentionPos = pos
              return false
            }
          })

          if (isMention) {
            // Get the suggestion index from the node attributes
            const suggestionIndex: number = mentionNode.attrs.mentionSuggestionIndex || 0

            // Get the correct suggestion configuration based on the index
            const suggestion = this.storage.suggestions[suggestionIndex]
            const suggestionChar = suggestion.char || ''

            tr.insertText(
              this.options.deleteTriggerWithBackspace ? '' : suggestionChar,
              mentionPos,
              mentionPos + mentionNode.nodeSize,
            )
          }

          return isMention
        }),
    }
  },

  addProseMirrorPlugins() {
    // Create a plugin for each suggestion configuration
    return this.storage.suggestions.map(suggestion => {
      return Suggestion({
        ...suggestion,
      })
    })
  },

  onBeforeCreate() {
    this.storage.suggestions = (
      this.options.suggestions.length ? this.options.suggestions : [this.options.suggestion]
    ).map((suggestion, index) => {
      return {
        editor: this.editor,
        ...getDefaultSuggestionAttributes(this.name, index),
        ...suggestion,
      }
    })
  },
})
