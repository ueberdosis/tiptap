import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import { Node as ProsemirrorNode } from 'prosemirror-model'
import LinterPlugin, { Result as Issue } from './LinterPlugin'

interface IconDivElement extends HTMLDivElement {
  issue?: Issue
}

function renderIcon(issue: Issue) {
  const icon: IconDivElement = document.createElement('div')

  icon.className = 'lint-icon'
  icon.title = issue.message
  icon.issue = issue

  return icon
}

function runAllLinterPlugins(doc: ProsemirrorNode, plugins: Array<typeof LinterPlugin>) {
  const decorations: [any?] = []

  const results = plugins.map(RegisteredLinterPlugin => {
    return new RegisteredLinterPlugin(doc).scan().getResults()
  }).flat()

  results.forEach(issue => {
    decorations.push(Decoration.inline(issue.from, issue.to, {
      class: 'problem',
    }),
    Decoration.widget(issue.from, renderIcon(issue)))
  })

  return DecorationSet.create(doc, decorations)
}

export interface LinterOptions {
  plugins: Array<typeof LinterPlugin>,
}

export const Linter = Extension.create<LinterOptions>({
  name: 'linter',

  addOptions() {
    return {
      plugins: [],
    }
  },

  addProseMirrorPlugins() {
    const { plugins } = this.options

    return [
      new Plugin({
        key: new PluginKey('linter'),
        state: {
          init(_, { doc }) {
            return runAllLinterPlugins(doc, plugins)
          },
          apply(transaction, oldState) {
            return transaction.docChanged
              ? runAllLinterPlugins(transaction.doc, plugins)
              : oldState
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
          handleClick(view, _, event) {
            const target = (event.target as IconDivElement)

            if (/lint-icon/.test(target.className) && target.issue) {
              const { from, to } = target.issue

              view.dispatch(
                view.state.tr
                  .setSelection(TextSelection.create(view.state.doc, from, to))
                  .scrollIntoView(),
              )

              return true
            }

            return false
          },
          handleDoubleClick(view, _, event) {
            const target = (event.target as IconDivElement)

            if (/lint-icon/.test((event.target as HTMLElement).className) && target.issue) {
              const prob = target.issue

              if (prob.fix) {
                prob.fix(view, prob)
                view.focus()
                return true
              }
            }

            return false
          },
        },
      }),
    ]
  },
})
