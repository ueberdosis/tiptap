import { mergeAttributes, Node } from '@tiptap/core'
import type { DOMOutputSpec } from '@tiptap/pm/model'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { SuggestionOptions } from '@tiptap/suggestion'
import Suggestion from '@tiptap/suggestion'

import { getSuggestionOptions } from './utils/get-default-suggestion-attributes.js'

// See `addAttributes` below
export interface MentionNodeAttrs {
  /**
   * The identifier for the selected item that was mentioned, stored as a `data-id`
   * attribute.
   */
  id: string | null;
  /**
   * The label to be rendered by the editor as the displayed text for this mentioned
   * item, if provided. Stored as a `data-label` attribute. See `renderLabel`.
   */
  label?: string | null
  /**
   * The character that triggers the suggestion, stored as
   * `data-mention-suggestion-char` attribute.
   */
  mentionSuggestionChar?: string
}

export interface MentionOptions<SuggestionItem = any, Attrs extends Record<string, any> = MentionNodeAttrs> {
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
    suggestion: SuggestionOptions | null
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
    suggestion: SuggestionOptions | null
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
    suggestion: SuggestionOptions | null
  }) => DOMOutputSpec

  /**
   * Whether to delete the trigger character with backspace.
   * @default false
   */
  deleteTriggerWithBackspace: boolean

  /**
   * The suggestion options, when you want to support multiple triggers.
   *
   * With this parameter, you can define multiple types of mention. For example, you can use the `@` character
   * to mention users and the `#` character to mention tags.
   *
   * @default [{ char: '@', pluginKey: MentionPluginKey }]
   * @example [{ char: '@', pluginKey: MentionPluginKey }, { char: '#', pluginKey: new PluginKey('hashtag') }]
   */
  suggestions: Array<Omit<SuggestionOptions<SuggestionItem, Attrs>, 'editor'>>

  /**
   * The suggestion options, when you want to support only one trigger. To support multiple triggers, use the
   * `suggestions` parameter instead.
   *
   * @default {}
   * @example { char: '@', pluginKey: MentionPluginKey, command: ({ editor, range, props }) => { ... } }
   */
  suggestion: Omit<SuggestionOptions<SuggestionItem, Attrs>, 'editor'>
}

/**
 * Storage properties or the Mention extension
 */
export interface MentionStorage<SuggestionItem = any, Attrs extends Record<string, any> = MentionNodeAttrs> {
  /**
   * The list of suggestions that will trigger the mention.
   */
  suggestions: Array<SuggestionOptions<SuggestionItem, Attrs>>

  /**
   * Returns the suggestion options of the mention that has a given character trigger. If not
   * found, it returns the first suggestion.
   *
   * @param char The character that triggers the mention
   * @returns The suggestion options
   */
  getSuggestionFromChar: (char: string) => SuggestionOptions<SuggestionItem, Attrs> | null
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
      getSuggestionFromChar: () => null,
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

      // When there are multiple types of mentions, this attribute helps distinguish them
      mentionSuggestionChar: {
        default: '@',
        parseHTML: element => element.getAttribute('data-mention-suggestion-char'),
        renderHTML: attributes => {
          return {
            'data-mention-suggestion-char': attributes.mentionSuggestionChar,
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
    // We cannot use the `this.storage` property here because, when accessed this method,
    // it returns the initial value of the extension storage
    const suggestion = (this.editor?.extensionStorage as unknown as Record<string, MentionStorage>)?.[
      this.name
    ]?.getSuggestionFromChar(node.attrs.mentionSuggestionChar)

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
      return [
        'span',
        mergeAttributes({ 'data-type': this.name }, this.options.HTMLAttributes, HTMLAttributes),
        html,
      ]
    }
    return html
  },

  renderText({ node }) {
    const args = {
      options: this.options,
      node,
      suggestion: (this.editor?.extensionStorage as unknown as Record<string, MentionStorage>)?.[
        this.name
      ]?.getSuggestionFromChar(node.attrs.mentionSuggestionChar),
    }

    if (this.options.renderLabel !== undefined) {
      console.warn('renderLabel is deprecated use renderText and renderHTML instead')
      return this.options.renderLabel(args)
    }

    return this.options.renderText(args)
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => this.editor.commands.command(({ tr, state }) => {
        let isMention = false
        const { selection } = state
        const { empty, anchor } = selection

        if (!empty) {
          return false
        }

        state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
          if (node.type.name === this.name) {
            isMention = true
            tr.insertText(
              this.options.deleteTriggerWithBackspace ? '' : this.options.suggestion.char || '',
              pos,
              pos + node.nodeSize,
            )

            return false
          }
        })

        // Store node and position for later use
        let mentionNode = new ProseMirrorNode()
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
          tr.insertText(
            this.options.deleteTriggerWithBackspace ? '' : mentionNode.attrs.mentionSuggestionChar,
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
    return this.storage.suggestions.map(Suggestion)
  },

  onBeforeCreate() {
    this.storage.suggestions = (
      this.options.suggestions.length ? this.options.suggestions : [this.options.suggestion]
    ).map(suggestion => getSuggestionOptions({
      editor: this.editor,
      overrideSuggestionOptions: suggestion,
      extensionName: this.name,
      char: suggestion.char,
    }))

    this.storage.getSuggestionFromChar = char => {
      const suggestion = this.storage.suggestions.find(s => s.char === char)

      if (suggestion) {
        return suggestion
      }
      if (this.storage.suggestions.length) {
        return this.storage.suggestions[0]
      }

      return null
    }
  },
})
