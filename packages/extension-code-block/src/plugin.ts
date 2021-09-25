// Modified from
// https://github.com/ProseMirror/prosemirror-inputrules/blob/master/src/inputrules.js
// license: MIT

import { InputRule } from 'prosemirror-inputrules'
import { Plugin as ProseMirrorPlugin } from 'prosemirror-state'
import type { Plugin, TextSelection } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

const MAX_MATCH = 500

function run(view: EditorView, from: number, to: number, text: string, rules: any[], plugin: Plugin) {
  if (view.composing) return false
  const state = view.state; const
    $from = state.doc.resolve(from)
  if ($from.parent.type.spec.code) return false
  const textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset,
    undefined, '\ufffc') + text
  for (let i = 0; i < rules.length; i += 1) {
    const match = rules[i].match.exec(textBefore)
    const tr = match && rules[i].handler(state, match, from - (match[0].length - text.length), to)
    if (!tr) continue
    view.dispatch(tr.setMeta(plugin, {
      transform: tr, from, to, text,
    }))
    return true
  }
  return false
}

export default function (options: any = {}) {
  const rules: InputRule[] = options.rules || []
  const plugin: Plugin = new ProseMirrorPlugin({
    props: {
      handleKeyDown(view, event) {
        if (event.key !== 'Enter') return false
        const { $cursor } = view.state.selection as TextSelection
        if ($cursor) return run(view, $cursor.pos, $cursor.pos, '\n', rules, plugin)
        return false
      },
    },
  })

  return plugin
}
