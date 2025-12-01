import './styles.scss'

import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Placeholder } from '@tiptap/extensions'
import type { Node } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { type MappablePosition, EditorContent, Extension, useEditor } from '@tiptap/react'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'

/**
 * Creates a ProseMirror DecorationSet from a list of decoration data.
 * @returns A ProseMirror DecorationSet
 */
function createDecorations(data: MappablePosition[], doc: Node): DecorationSet {
  return DecorationSet.create(
    doc,
    data.map(({ position }) =>
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
  decorationData: MappablePosition[]
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
            decorationData: [],
            decorations: DecorationSet.empty,
          }),
          apply(transaction, pluginState, _oldState, newState) {
            let decorationData = pluginState.decorationData

            // If the transaction changes the document, update the decoration
            // positions
            if (transaction.docChanged) {
              decorationData = decorationData.map(position => {
                const result = editor.utils.getUpdatedPosition(position, transaction)
                return result.position
              })
            }

            // If the transaction adds a decoration, add it to the decoration data.
            const metadata = transaction.getMeta(DecorationsPluginKey) as MappablePosition | undefined
            if (metadata) {
              decorationData.push(metadata)
            }

            return {
              decorationData,
              // Create new ProseMirror decorations in the positions determined
              // by the decoration data.
              decorations: createDecorations(decorationData, newState.doc),
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
              const decorationData = editor.utils.createMappablePosition(position)
              props.tr.setMeta(DecorationsPluginKey, decorationData)
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
