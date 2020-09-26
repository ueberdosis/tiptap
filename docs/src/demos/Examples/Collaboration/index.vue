<template>
  <div>
    <button @click="setName">
      set username
    </button>
    <button @click="changeColor">
      change color
    </button>

    <div class="collaboration-status">
      {{ users.length }} user{{ numberOfConnectedUsers === 1 ? '' : 's' }}
    </div>
    <div class="collaboration-users">
      <div
        class="collaboration-users__item"
        :style="`background-color: ${user.color}`"
        v-for="user in users"
        :key="user.id"
      >
        {{ user.name }}
      </div>
    </div>

    <editor-content :editor="editor" />

    <div class="collaboration-debug">
      name: {{ name }};
      color: {{ color }};
      bcPeers: {{ numberOfBcPeers }};
      webRtcPeers: {{ numberOfWebRtcPeers }};
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      name: 'Other User',
      color: this.getRandomColor(),
      ydoc: null,
      provider: null,
      type: null,
      indexdb: null,
      numberOfConnectedUsers: 0,
      numberOfBcPeers: 0,
      numberOfWebRtcPeers: 0,
      editor: null,
      users: [],
    }
  },

  mounted() {
    const documentName = 'tiptap-collaboration-example'

    this.ydoc = new Y.Doc()
    this.provider = new WebrtcProvider(documentName, this.ydoc)
    this.type = this.ydoc.getXmlFragment('prosemirror')
    this.indexdb = new IndexeddbPersistence(documentName, this.ydoc)

    this.provider.awareness.on('change', this.updateState)

    this.editor = new Editor({
      // TODO: This is added by every new user.
      // content: `
      //   <p>Example Text</p>
      // `,
      extensions: [
        Document(),
        Paragraph(),
        Text(),
        Collaboration({
          provider: this.provider,
          type: this.type,
        }),
        CollaborationCursor({
          provider: this.provider,
          name: this.name,
          color: this.color,
        }),
      ],
    })
  },

  methods: {
    setName() {
      this.name = window.prompt('Name')
      this.updateUser()
    },

    changeColor() {
      this.color = this.getRandomColor()
      this.updateUser()
    },

    updateUser() {
      this.editor.chain().focus().user({
        name: this.name,
        color: this.color,
      }).run()

      this.updateState()
    },

    getRandomColor() {
      const colors = [
        '#f03e3e',
        '#d6336c',
        '#ae3ec9',
        '#7048e8',
        '#4263eb',
        '#1c7ed6',
        '#1098ad',
        '#0ca678',
        '#37b24d',
        '#74b816',
        '#f59f00',
        '#f76707',
      ]

      return colors[Math.floor(Math.random() * colors.length)]
    },

    updateState() {
      const { states } = this.provider.awareness

      this.users = Array.from(states.entries()).map(state => {
        return {
          id: state[0],
          ...state[1].user,
        }
      })
    },
  },

  beforeDestroy() {
    this.editor.destroy()
    this.provider.destroy()
  },
}
</script>

<style lang="scss" src="./style.scss">
