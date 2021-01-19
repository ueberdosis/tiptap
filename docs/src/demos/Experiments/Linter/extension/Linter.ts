// @ts-nocheck
import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state'

function renderIcon(issue) {
  const icon = document.createElement('div')

  icon.className = 'lint-icon'
  icon.title = issue.message
  icon.issue = issue

  return icon
}

function runAllLinterPlugins(doc, plugins) {
  const decorations: [any?] = []

  const results = plugins.map(LinterPlugin => {
    return new LinterPlugin(doc).scan().getResults()
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
  plugins: [any],
}

export const Linter = Extension.create({
  name: 'linter',

  defaultOptions: <LinterOptions>{
    plugins: [],
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
          apply(transaction, prevState) {
            return transaction.docChanged
              ? runAllLinterPlugins(transaction.doc, plugins)
              : prevState
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
          handleClick(view, _, event) {
            if (/lint-icon/.test(event.target.className)) {
              const { from, to } = event.target.issue

              view.dispatch(
                view.state.tr
                  .setSelection(TextSelection.create(view.state.doc, from, to))
                  .scrollIntoView(),
              )

              return true
            }
          },
          handleDoubleClick(view, _, event) {
            if (/lint-icon/.test(event.target.className)) {
              const prob = event.target.issue

              if (prob.fix) {
                prob.fix(view)
                view.focus()
                return true
              }
            }
          },
        },
      }),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Linter: typeof Linter,
  }
}
