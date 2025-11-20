import './styles.scss'

import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Placeholder } from '@tiptap/extensions'
import type { Node } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { EditorContent, Extension, useEditor } from '@tiptap/react'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'

/**
 * Creates a ProseMirror DecorationSet from a list of positions.
 * @param positions - The positions where the decorations should be placed.
 * @returns A ProseMirror DecorationSet
 */
function createDecorations(positions: number[], doc: Node): DecorationSet {
  return DecorationSet.create(
    doc,
    positions.map(position =>
      Decoration.widget(position, () => {
        const element = document.createElement('span')
        element.classList.add('decoration')
        return element
      }),
    ),
  )
}

/**
 * The state of the DecorationsExtension ProseMirror plugin.
 */
interface PluginState {
  positions: number[]
  decorations: DecorationSet
}

const DecorationsPluginKey = new PluginKey('decorations')

/**
 * An extension that allows you to insert decorations into the editor. Inside
 * its ProseMirror plugin, it keeps track of the decoration data and
 * decorations.
 */
const DecorationsExtension = Extension.create({
  name: 'decorations',
  addProseMirrorPlugins() {
    const editor = this.editor
    return [
      new Plugin<PluginState>({
        key: DecorationsPluginKey,
        state: {
          init: () => ({
            positions: [],
            decorations: DecorationSet.empty,
          }),
          apply(transaction, pluginState, _oldState, newState) {
            let positions = pluginState.positions

            // If the transaction changes the document, update the decoration
            // positions
            if (transaction.docChanged) {
              positions = editor.utils.getUpdatedPositions(positions, transaction).map(r => r.position)
            }

            // If the transaction adds a decoration, add it to the decoration data.
            const metadata = transaction.getMeta(DecorationsPluginKey) as number | undefined
            if (metadata) {
              positions.push(metadata)
            }

            return {
              positions,
              // Create new ProseMirror decorations in the positions determined
              // by the decoration data.
              decorations: createDecorations(positions, newState.doc),
            }
          },
        },
        props: {
          decorations: state => DecorationsPluginKey.getState(state)?.decorations,
        },
      }),
    ]
  },
})

const ydoc = new Y.Doc()

// eslint-disable-next-line no-new
new WebrtcProvider('tiptap-collaboration-extension', ydoc)

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: ydoc,
        enablePositionMapping: true,
      }),
      Placeholder.configure({
        placeholder: 'Write something … It’ll be shared with everyone else looking at this example.',
      }),
      DecorationsExtension,
    ],
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div>
        <button
          onClick={() =>
            editor.commands.command(props => {
              const position = props.state.selection.from
              props.tr.setMeta(DecorationsPluginKey, position)
              return true
            })
          }
        >
          Insert decoration
        </button>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
