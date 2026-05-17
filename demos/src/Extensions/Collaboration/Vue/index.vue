<template>
  <editor-content :editor="editor" />
</template>

<script>
import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { Placeholder } from '@tiptap/editor/extensions/placeholder'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      provider: null,
    }
  },

  mounted() {
    const ydoc = new Y.Doc()

    this.provider = new WebrtcProvider('tiptap-collaboration-extension', ydoc)

    this.editor = new Editor({
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
      ],
    })
  },

  beforeUnmount() {
    this.editor.destroy()
    this.provider.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* Placeholder (at the top) */
  p.is-editor-empty:first-child::before {
    color: var(--gray-4);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
}
</style>
