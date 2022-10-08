import { Editor, Mark, mergeAttributes } from '@tiptap/core'
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { PluginKey } from 'prosemirror-state'

export type MentionOptions = {
  HTMLAttributes: Record<string, any>;
  renderLabel: (props: { options: MentionOptions; node: ProseMirrorNode }) => string;
  suggestion: Omit<SuggestionOptions, 'editor'>;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hashtag: {
      setHashtag: () => ReturnType;
      toggleHashtag: () => ReturnType;
      unsetHashtag: () => ReturnType;
    };
  }
}

export type HashtagOptions = {
  HTMLAttributes: Record<string, any>,
  suggestion: Omit<SuggestionOptions, 'editor'>,
}

export const HashtagPluginKey = new PluginKey('hashtag')

let lastText = ''
const parseHashtags = (editor: Editor) => {
  const $position = editor.view.state.selection.$from
  const regexp = /(^|\s)#(\w+)/g
  const text = $position.parent.textContent
  const parentPos = $position.pos - $position.parentOffset

  if (lastText === text) {
    return
  }
  lastText = text

  const matches = text.matchAll(regexp)

  const chain = editor.chain()

  chain
    .setTextSelection({
      from: parentPos,
      to: parentPos + text.length,
    })
    .unsetHashtag();

  [...matches].forEach(match => {
    const plusOne = match[0].startsWith(' ') ? 1 : 0
    let nodesBefore = 0

    if (match.index) {
      $position.parent.content.nodesBetween(0, match.index + match[0].length - 2, node => {
        if (!node.isText) {
          nodesBefore += 1
        }
      })
    }
    if (match.index) {
      chain
        .setTextSelection({
          from: nodesBefore + parentPos + match.index + plusOne,
          to: nodesBefore + parentPos + match.index + match[0].length,
        })
        .setHashtag()
    }
  })

  chain
    .setTextSelection({
      from: $position.pos,
      to: $position.pos,
    })
    .unsetHashtag()
    .run()
}

export const Hashtag = Mark.create<HashtagOptions>({
  name: 'hashtag',
  addOptions() {
    return {
      HTMLAttributes: {},
      suggestion: {
        char: '#',
        pluginKey: HashtagPluginKey,
        command: ({ editor, range, props }) => {
          const nodeAfter = editor.view.state.selection.$to.nodeAfter
          const overrideSpace = nodeAfter?.text?.startsWith(' ')

          if (overrideSpace) {
            range.to += 1
          }
          (editor as Editor)
            .chain()
            .focus()
            .insertContentAt(range, `#${props.id}`)
            .insertContent(' ')
            .toggleHashtag()
            .run()
          window.getSelection()?.collapseToEnd()
        },
      },
    }
  },
  addCommands() {
    return {
      setHashtag:
        () => ({ commands }) => {
          return commands.setMark(this.name)
        },
      toggleHashtag:
        () => ({ commands }) => {
          return commands.toggleMark(this.name)
        },
      unsetHashtag:
        () => ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'span',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ class: 'hashtag' }, this.options.HTMLAttributes, HTMLAttributes), 0]
  },
  onUpdate() {
    parseHashtags(this.editor)
  },
  addProseMirrorPlugins() {
    if (this.options.suggestion) {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,
        }),
      ]
    }
    return []
  },
})
