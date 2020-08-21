import { Plugin, PluginKey } from 'prosemirror-state'
import Editor from '../..'

export default (editor: Editor) => new Plugin({
  key: new PluginKey('editable'),
  props: {
    editable: () => editor.options.editable,
  },
})