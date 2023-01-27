import { Editor, Extension, Range } from '@tiptap/core'
import { NodeWithPos } from '@tiptap/vue-2'
import debounce from 'lodash/debounce'
import { CreateCompletionRequest, OpenAIApi } from 'openai'
import { Node as ProsemirrorNode } from 'prosemirror-model'
import { Plugin, Selection } from 'prosemirror-state'
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view'

export interface OpenaiOptions {
  openai: OpenAIApi | null
  completion: CreateCompletionRequest
}

export const Openai = Extension.create<OpenaiOptions>({
  name: 'openai',
  addOptions() {
    return {
      openai: null,
      completion: {
        model: 'text-davinci-003',
        temperature: 0,
        max_tokens: 45,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0,
      },
    }
  },
  editor: Editor,
  editorView: EditorView,
  addProseMirrorPlugins() {
    function findBlockNodes(doc: ProsemirrorNode, selection:Selection) {
      const results: NodeWithPos[] = []

      doc.nodesBetween(selection.from, selection.to, (node, pos) => {
        results.push({ node, pos })
      })

      return results.filter(child => child.node.isBlock)
    }

    function renderSuggestion(suggestion: string) {
      const suggestionWidget: HTMLElement = document.createElement('p')

      suggestionWidget.className = 'suggestion'
      suggestionWidget.innerHTML = suggestion

      return suggestionWidget
    }

    function decorateNodes(nodes: NodeWithPos[], prompt: string, suggestion:string) {
      return nodes.map(item => {
        return [
          Decoration.inline(item.pos, item.pos + item.node.nodeSize, {
            class: 'prompt',
          }),
          Decoration.widget(item.pos, renderSuggestion(suggestion)),
        ]
      }).flat()
    }

    const apiRequest = async (matching: NodeWithPos[]) => {
      const prompt = matching.find(item => item.node.textContent)?.node?.textContent || ''

      if (!prompt.length) {
        return
      }

      const results = (await this.options.openai?.createCompletion({
        ...this.options.completion,
        prompt,
      })) || { data: { choices: [] } }

      const {
        data: { choices },
      } = results
      const [choice] = choices

      const newDecs = decorateNodes(matching, prompt, `${prompt}${choice.text || ''}`)
      const transaction = this.editor.view.state.tr.setMeta('asyncDecorations', newDecs)

      this.editor.view.dispatch(transaction)
    }

    const validatePrompt = (range:Range, text:string) => {
      this.editor.chain()
        .focus()
        .insertContentAt(range, text, { updateSelection: true })
        .focus()
        .run()
    }

    const debouncedApiRequest = debounce(apiRequest, 1000)

    return [
      new Plugin({
        state: {
          init: (_, state) => {
            return DecorationSet.create(state.doc, [])
          },
          apply: (tr, state) => {
            const { isEditable } = this.editor
            const selection = tr.selection

            if (tr.docChanged && isEditable) {
              const { doc } = tr

              // Find all nodes with text to send to the spell checker
              const matching = findBlockNodes(doc, selection)
                .filter(item => {
                  return item.node.isTextblock
                })

              debouncedApiRequest(matching)
            }

            const asyncDecs:Decoration[] = tr.getMeta('asyncDecorations')

            if (asyncDecs === undefined && !tr.docChanged) {
              return state
            }

            return DecorationSet.create(tr.doc, asyncDecs || [])
          },
        },

        props: {
          handleKeyDown(view, event) {
            const state: DecorationSet = this.getState(view.state)

            const [suggestion, prompt]: any[] = view.state.tr.getMeta('asyncDecorations') || state.find() || []

            if (suggestion) {
              switch (event.key) {
                case 'Delete':
                case 'Tab': {
                  event.preventDefault()
                  if (event.key === 'Tab') {
                    validatePrompt(prompt, suggestion.type.toDOM.innerHTML)
                  }
                  debouncedApiRequest.cancel()
                  break
                }

                default:
                  break
              }
            }

            state.remove([suggestion])
            state.remove([prompt])

            return false
          },
          decorations(state) {
            return this.getState(state)
          },
        },
      }),

    ]
  },
})
